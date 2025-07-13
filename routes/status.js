import express from 'express';
import store from '../store/memoryStore.js';
 
const router = express.Router();
 
router.get('/status/:kickoff_id', (req, res) => {
  const { kickoff_id } = req.params;
  const data = store.get(kickoff_id);
  if (!data) {
    return res.status(404).json({ error: 'kickoff_id not found' });
  }
  
  // Enhance the response to include XPath suggestions
  const enhancedData = {
    ...data.summary,
    elements_with_suggested_xpaths: data.summary.missing_resource_id_details.filter(e => e.suggested_xpaths && e.suggested_xpaths.length > 0).length,
    suggested_xpath_examples: []
  };
  
  // Add some example XPath suggestions to the response
  data.summary.missing_resource_id_details.forEach(element => {
    if (element.suggested_xpaths && element.suggested_xpaths.length > 0) {
      enhancedData.suggested_xpath_examples.push({
        original_xpath: element.xpath,
        text: element.text || 'No text',
        resource_id: element.resource_id || 'No resource-id',
        suggested_xpaths: element.suggested_xpaths.slice(0, 5) // Limit to top 5 suggestions
      });
    }
  });

  // Add full details for all elements without resource-id
  enhancedData.missing_resource_id_details_full = data.summary.missing_resource_id_details.map(element => ({
    actual_xpath: element.xpath,
    text: element.text || '',
    resource_id: element.resource_id || '',
    suggested_xpaths: element.suggested_xpaths || []
  }));

  // Add suggestions for elements WITH resource-id that have duplicates
  enhancedData.elements_with_duplicates = data.summary.with_resource_id_details.filter(e => e.suggested_xpaths && e.suggested_xpaths.length > 0);
  
  // Add summary statistics
  enhancedData.suggestion_statistics = {
    total_suggestions_generated: data.summary.missing_resource_id_details.reduce((sum, e) => sum + (e.suggested_xpaths ? e.suggested_xpaths.length : 0), 0),
    very_high_reliability: 0,
    high_reliability: 0,
    medium_reliability: 0,
    low_reliability: 0
  };

  // Count reliability levels
  data.summary.missing_resource_id_details.forEach(element => {
    if (element.suggested_xpaths) {
      element.suggested_xpaths.forEach(suggestion => {
        switch (suggestion.reliability) {
          case 'very_high':
            enhancedData.suggestion_statistics.very_high_reliability++;
            break;
          case 'high':
            enhancedData.suggestion_statistics.high_reliability++;
            break;
          case 'medium':
            enhancedData.suggestion_statistics.medium_reliability++;
            break;
          case 'low':
            enhancedData.suggestion_statistics.low_reliability++;
            break;
        }
      });
    }
  });
  
  res.json({
    kickoff_id,
    data: enhancedData,
    state: "SUCCESS"
  });
});
 
export default router;
 