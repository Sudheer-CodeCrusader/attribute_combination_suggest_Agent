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
        suggested_xpaths: element.suggested_xpaths.slice(0, 3) // Limit to top 3 suggestions
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
  
  res.json({
    kickoff_id,
    data: enhancedData,
    state: "SUCCESS"
  });
});

export default router; 