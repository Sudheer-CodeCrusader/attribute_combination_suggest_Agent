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
        clickable: element.clickable || 'not_specified',
        suggested_xpaths: element.suggested_xpaths.slice(0, 5) // Limit to top 5 suggestions
      });
    }
  });

  // Add full details for all elements without resource-id
  enhancedData.missing_resource_id_details_full = data.summary.missing_resource_id_details.map(element => ({
    actual_xpath: element.xpath,
    text: element.text || '',
    resource_id: element.resource_id || '',
    clickable: element.clickable || 'not_specified',
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

  // Enhanced clickable analysis from XML
  if (data.summary.clickable_analysis) {
    enhancedData.clickable_analysis_xml = {
      total_elements: data.summary.clickable_analysis.total_elements,
      clickable_true: data.summary.clickable_analysis.clickable_true,
      clickable_false: data.summary.clickable_analysis.clickable_false,
      clickable_not_specified: data.summary.clickable_analysis.clickable_not_specified,
      clickable_percentage: data.summary.clickable_analysis.clickable_percentage,
      clickable_elements_details: data.summary.clickable_elements_details || [],
      non_clickable_elements_details: data.summary.non_clickable_elements_details || [],
      clickable_elements_with_resource_id: data.summary.clickable_elements_with_resource_id || 0,
      clickable_elements_without_resource_id: data.summary.clickable_elements_without_resource_id || 0
    };
  }

  // Enhanced clickable analysis from image
  if (data.imageAnalysis) {
    enhancedData.clickable_analysis_image = {
      total_elements_detected: data.imageAnalysis.clickable_attributes.total_elements_detected,
      clickable_elements: data.imageAnalysis.clickable_attributes.clickable_elements,
      non_clickable_elements: data.imageAnalysis.clickable_attributes.non_clickable_elements,
      clickable_percentage: data.imageAnalysis.clickable_attributes.clickable_percentage,
      analysis_method: data.imageAnalysis.image_analysis?.analysis_method || 'basic_image_analysis'
    };
  }

  // Combined clickable analysis summary
  enhancedData.combined_clickable_analysis = {
    xml_analysis: data.summary.clickable_analysis ? {
      total_elements: data.summary.clickable_analysis.total_elements,
      clickable_true: data.summary.clickable_analysis.clickable_true,
      clickable_false: data.summary.clickable_analysis.clickable_false,
      clickable_percentage: data.summary.clickable_analysis.clickable_percentage
    } : null,
    image_analysis: data.imageAnalysis ? {
      total_elements_detected: data.imageAnalysis.clickable_attributes.total_elements_detected,
      clickable_elements: data.imageAnalysis.clickable_attributes.clickable_elements,
      clickable_percentage: data.imageAnalysis.clickable_attributes.clickable_percentage
    } : null,
    comparison: data.summary.clickable_analysis && data.imageAnalysis ? {
      xml_clickable_count: data.summary.clickable_analysis.clickable_true,
      image_clickable_count: data.imageAnalysis.clickable_attributes.clickable_elements,
      xml_total_elements: data.summary.clickable_analysis.total_elements,
      image_total_elements: data.imageAnalysis.clickable_attributes.total_elements_detected
    } : null
  };

  // Add clickable conflicts analysis
  if (data.summary.clickable_conflicts) {
    enhancedData.clickable_conflicts = data.summary.clickable_conflicts;
    enhancedData.clickable_conflicts_summary = {
      total_conflicts: data.summary.clickable_conflicts.length,
      conflict_details: data.summary.clickable_conflicts.map(conflict => ({
        resource_id: conflict.resource_id,
        clickable_values: conflict.clickable_values,
        conflict_type: conflict.clickable_values.includes('true') && conflict.clickable_values.includes('false') ? 'true_false_mixed' : 'undefined_mixed'
      }))
    };
  }

  // Add risky elements analysis
  if (data.summary.risky_elements) {
    enhancedData.risky_elements = data.summary.risky_elements;
    enhancedData.risky_elements_summary = {
      total_risky_elements: data.summary.risky_elements.length,
      risk_level: data.summary.risky_elements.length > 0 ? 'high' : 'low',
      risk_description: data.summary.risky_elements.length > 0 ? 
        `${data.summary.risky_elements.length} clickable elements without resource-id, text, or reliable XPath suggestions` : 
        'No risky clickable elements detected'
    };
  }
  
  res.json({
    kickoff_id,
    data: enhancedData,
    state: "SUCCESS"
  });
});
 
export default router;
 