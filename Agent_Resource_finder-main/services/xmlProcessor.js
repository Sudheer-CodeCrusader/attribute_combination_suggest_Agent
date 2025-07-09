import xml2js from 'xml2js';

// Helper function to generate XPath suggestions
function generateXPathSuggestions(element, allElements) {
  const suggestions = [];
  
  // Get element attributes
  const { attributes, xpath, tag } = element;
  
  // 1. Direct by exact text (most reliable)
  if (attributes.text && attributes.text.trim()) {
    const text = attributes.text.trim();
    suggestions.push({
      type: 'exact_text',
      xpath: `//${tag}[@text='${text}']`,
      description: `Direct match by exact text "${text}"`,
      reliability: 'high'
    });
  }
  
  // 2. Using normalize-space for whitespace safety
  if (attributes.text && attributes.text.trim()) {
    const text = attributes.text.trim();
    suggestions.push({
      type: 'normalize_space',
      xpath: `//${tag}[normalize-space(.)='${text}']`,
      description: `Using normalize-space for whitespace safety`,
      reliability: 'high'
    });
  }
  
  // 3. Content-based identification with resource-id
  if (attributes['resource-id'] && attributes.text && attributes.text.trim()) {
    const text = attributes.text.trim();
    suggestions.push({
      type: 'content_with_resource_id',
      xpath: `//${tag}[@resource-id='${attributes['resource-id']}' and @text='${text}']`,
      description: `Combined resource-id and text for unique identification`,
      reliability: 'very_high'
    });
  }
  
  // 4. Parent-child relationship identification
  const parentChildSuggestions = generateParentChildSuggestions(element, allElements);
  suggestions.push(...parentChildSuggestions);
  
  // 5. Sibling relationship identification
  const siblingSuggestions = generateSiblingSuggestions(element, allElements);
  suggestions.push(...siblingSuggestions);
  
  // 6. Multiple attribute combinations
  const attributeCombinationSuggestions = generateAttributeCombinationSuggestions(element, allElements);
  suggestions.push(...attributeCombinationSuggestions);
  
  // 7. Context-based identification
  const contextSuggestions = generateContextBasedSuggestions(element, allElements);
  suggestions.push(...contextSuggestions);
  
  // 8. Scoped under specific containers with content
  const scopedSuggestions = generateScopedSuggestions(element, allElements);
  suggestions.push(...scopedSuggestions);
  
  // Sort by reliability (very_high, high, medium, low)
  const reliabilityOrder = { 'very_high': 4, 'high': 3, 'medium': 2, 'low': 1 };
  suggestions.sort((a, b) => (reliabilityOrder[b.reliability] || 0) - (reliabilityOrder[a.reliability] || 0));
  
  return suggestions;
}

// Helper function to generate parent-child relationship suggestions
function generateParentChildSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  
  // Find parent containers with resource-id
  const parentContainers = findParentContainers(element, allElements);
  
  parentContainers.forEach(container => {
    if (container.attributes['resource-id']) {
      suggestions.push({
        type: 'parent_child_with_resource_id',
        xpath: `//${container.tag}[@resource-id='${container.attributes['resource-id']}']//${tag}[@text='${text}']`,
        description: `Scoped under ${container.tag} with resource-id`,
        reliability: 'high'
      });
    }
  });
  
  return suggestions;
}

// Helper function to generate sibling relationship suggestions
function generateSiblingSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  
  // Find sibling elements with descriptive text
  const siblings = findSiblingElements(element, allElements);
  
  siblings.forEach(sibling => {
    if (sibling.attributes.text && sibling.attributes.text.trim()) {
      const siblingText = sibling.attributes.text.trim();
      
      suggestions.push({
        type: 'sibling_relationship',
        xpath: `//${sibling.tag}[@text='${siblingText}']/following-sibling::${tag}[@text='${text}']`,
        description: `Following sibling of "${siblingText}"`,
        reliability: 'medium'
      });
      
      suggestions.push({
        type: 'sibling_ancestor',
        xpath: `//${sibling.tag}[@text='${siblingText}']/ancestor::*[1]//${tag}[@text='${text}']`,
        description: `Within same ancestor as "${siblingText}"`,
        reliability: 'medium'
      });
    }
  });
  
  return suggestions;
}

// Helper function to find sibling elements
function findSiblingElements(element, allElements) {
  const siblings = [];
  const elementPath = element.xpath.split('/');
  const parentPath = elementPath.slice(0, -1).join('/');
  
  allElements.forEach(other => {
    if (other.xpath === element.xpath) return;
    
    const otherPath = other.xpath.split('/');
    const otherParentPath = otherPath.slice(0, -1).join('/');
    
    // Check if they share the same parent
    if (parentPath === otherParentPath && other.attributes.text && other.attributes.text.trim()) {
      siblings.push(other);
    }
  });
  
  return siblings.slice(0, 3); // Limit to 3 siblings
}

// Helper function to generate attribute combination suggestions
function generateAttributeCombinationSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  const availableAttributes = [];
  
  // Collect available attributes
  if (attributes['resource-id']) availableAttributes.push(`@resource-id='${attributes['resource-id']}'`);
  if (attributes.class) availableAttributes.push(`@class='${attributes.class}'`);
  if (attributes.package) availableAttributes.push(`@package='${attributes.package}'`);
  if (attributes.clickable) availableAttributes.push(`@clickable='${attributes.clickable}'`);
  if (attributes.enabled) availableAttributes.push(`@enabled='${attributes.enabled}'`);
  
  // Generate combinations
  if (availableAttributes.length > 0) {
    const attributeCombination = availableAttributes.join(' and ');
    suggestions.push({
      type: 'attribute_combination',
      xpath: `//${tag}[${attributeCombination} and @text='${text}']`,
      description: `Combined attributes with text for unique identification`,
      reliability: 'high'
    });
  }
  
  return suggestions;
}

// Helper function to generate context-based suggestions
function generateContextBasedSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  
  // Find nearby elements that can provide context
  const contextElements = findContextElements(element, allElements);
  
  contextElements.forEach(context => {
    if (context.attributes.text && context.attributes.text.trim()) {
      const contextText = context.attributes.text.trim();
      
      suggestions.push({
        type: 'context_based',
        xpath: `//${context.tag}[contains(@text, '${contextText}')]/ancestor::*[1]//${tag}[@text='${text}']`,
        description: `Within context of "${contextText}"`,
        reliability: 'medium'
      });
    }
  });
  
  return suggestions;
}

// Helper function to find context elements
function findContextElements(element, allElements) {
  const contextElements = [];
  const elementLevel = element.xpath.split('/').length;
  
  allElements.forEach(other => {
    if (other.xpath === element.xpath) return;
    
    const otherLevel = other.xpath.split('/').length;
    const levelDiff = Math.abs(elementLevel - otherLevel);
    
    // Look for elements within 2 levels that have descriptive text
    if (levelDiff <= 2 && other.attributes.text && other.attributes.text.trim()) {
      const text = other.attributes.text.trim();
      // Prefer elements with longer, more descriptive text
      if (text.length > 3 && !text.match(/^\d+$/)) {
        contextElements.push(other);
      }
    }
  });
  
  return contextElements.slice(0, 3); // Limit to 3 context elements
}

// Helper function to generate scoped suggestions
function generateScopedSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  
  // Find specific containers that can scope the search
  const specificContainers = findSpecificContainers(element, allElements);
  
  specificContainers.forEach(container => {
    if (container.attributes['resource-id']) {
      suggestions.push({
        type: 'scoped_under_specific_container',
        xpath: `//${container.tag}[@resource-id='${container.attributes['resource-id']}']//${tag}[@text='${text}']`,
        description: `Scoped under specific ${container.tag} container`,
        reliability: 'high'
      });
    }
  });
  
  return suggestions;
}

// Helper function to find specific containers
function findSpecificContainers(element, allElements) {
  const containers = [];
  const containerTags = ['ScrollView', 'LinearLayout', 'FrameLayout', 'RelativeLayout', 'ConstraintLayout', 'GridView', 'RecyclerView'];
  
  // Find the element's path and extract container parents
  const pathParts = element.xpath.split('/').filter(part => part);
  let currentPath = '';
  
  for (let i = 0; i < pathParts.length - 1; i++) {
    currentPath += '/' + pathParts[i];
    const pathElement = allElements.find(e => e.xpath === currentPath);
    if (pathElement && containerTags.includes(pathElement.tag) && pathElement.attributes['resource-id']) {
      containers.push(pathElement);
    }
  }
  
  return containers;
}

// Helper function to find parent containers
function findParentContainers(element, allElements) {
  const containers = [];
  const containerTags = ['ScrollView', 'LinearLayout', 'FrameLayout', 'RelativeLayout', 'ConstraintLayout', 'GridView', 'RecyclerView'];
  
  // Find the element's path and extract container parents
  const pathParts = element.xpath.split('/').filter(part => part);
  let currentPath = '';
  
  for (let i = 0; i < pathParts.length - 1; i++) {
    currentPath += '/' + pathParts[i];
    const pathElement = allElements.find(e => e.xpath === currentPath);
    if (pathElement && containerTags.includes(pathElement.tag)) {
      containers.push(pathElement);
    }
  }
  
  return containers;
}

// Helper function to generate unique content-based XPath for repeated elements
function generateUniqueContentBasedXPath(element, allElements) {
  const { attributes, tag } = element;
  const suggestions = [];
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  const text = attributes.text.trim();
  
  // Find all elements with same resource-id and text
  const similarElements = allElements.filter(e => 
    e.tag === tag && 
    e.attributes['resource-id'] === attributes['resource-id'] &&
    e.attributes.text === attributes.text
  );
  
  if (similarElements.length > 1) {
    // Try to find unique parent context for each element
    similarElements.forEach((similarElement, index) => {
      const uniqueParent = findUniqueParentContext(similarElement, allElements);
      
      if (uniqueParent) {
        suggestions.push({
          type: 'unique_parent_context',
          xpath: `//${uniqueParent.tag}[@resource-id='${uniqueParent.attributes['resource-id']}']//${tag}[@text='${text}']`,
          description: `Unique identification through parent context`,
          reliability: 'high'
        });
      }
    });
  }
  
  return suggestions;
}

// Helper function to find unique parent context
function findUniqueParentContext(element, allElements) {
  const parentContainers = findParentContainers(element, allElements);
  
  // Find a parent that has a unique resource-id and can distinguish this element
  for (const container of parentContainers) {
    if (container.attributes['resource-id']) {
      // Check if this container uniquely identifies this element
      const elementsInContainer = allElements.filter(e => 
        e.xpath.startsWith(container.xpath) &&
        e.tag === element.tag &&
        e.attributes['resource-id'] === element.attributes['resource-id']
      );
      
      if (elementsInContainer.length === 1) {
        return container;
      }
    }
  }
  
  return null;
}

export async function processXml(xmlString) {
  let parsed;
  try {
    parsed = await xml2js.parseStringPromise(xmlString, { explicitArray: false, preserveChildrenOrder: true });
  } catch (e) {
    throw new Error('Malformed XML');
  }

  // Helper to traverse and collect info
  const elements = [];
  function traverse(node, path = '', indexMap = {}) {
    if (typeof node !== 'object' || node === null) return;
    for (const key in node) {
      if (key === '$' || key === '#name') continue;
      let children = Array.isArray(node[key]) ? node[key] : [node[key]];
      children.forEach((child, idx) => {
        child['#name'] = key;
        indexMap[key] = (indexMap[key] || 0) + 1;
        const currentPath = `${path}/${key}[${indexMap[key]}]`;
        elements.push({ tag: key, attributes: child['$'] || {}, xpath: currentPath });
        traverse(child, currentPath, {});
      });
    }
  }
  traverse(parsed, '', {});

  const withResourceId = elements.filter(e => e.attributes && e.attributes['resource-id']);
  const withoutResourceId = elements.filter(e => !e.attributes || !e.attributes['resource-id']);

  // For each with resource-id, get xpath and resource-id
  const with_resource_id_details = withResourceId.map(e => {
    let info = { xpath: e.xpath, resource_id: e.attributes['resource-id'] };
    if (e.attributes.bounds) info.bounds = e.attributes.bounds;
    if (e.attributes.text) info.text = e.attributes.text;
    if (e.attributes.focused) info.focused = e.attributes.focused;
    return info;
  });

  // For each without resource-id, get xpath, resource-id (will be undefined), and if available, bounds or text
  const missing_resource_id_details = withoutResourceId.map(e => {
    let info = { xpath: e.xpath, resource_id: e.attributes ? e.attributes['resource-id'] : undefined };
    if (e.attributes && e.attributes.bounds) info.bounds = e.attributes.bounds;
    if (e.attributes && e.attributes.text) info.text = e.attributes.text;
    if (e.attributes && e.attributes.focused) info.focused = e.attributes.focused;
    
    // Generate XPath suggestions for elements without resource IDs
    const suggestions = generateXPathSuggestions(e, elements);
    if (suggestions.length > 0) {
      info.suggested_xpaths = suggestions;
    }
    
    return info;
  });

  // Also generate suggestions for elements WITH resource-id that might have duplicates
  const withResourceIdWithSuggestions = withResourceId.map(e => {
    let info = { xpath: e.xpath, resource_id: e.attributes['resource-id'] };
    if (e.attributes.bounds) info.bounds = e.attributes.bounds;
    if (e.attributes.text) info.text = e.attributes.text;
    if (e.attributes.focused) info.focused = e.attributes.focused;
    
    // Check if this element has duplicates and needs unique XPath
    const similarElements = elements.filter(el => 
      el.tag === e.tag && 
      el.attributes['resource-id'] === e.attributes['resource-id']
    );
    
    if (similarElements.length > 1) {
      const suggestions = generateXPathSuggestions(e, elements);
      if (suggestions.length > 0) {
        info.suggested_xpaths = suggestions;
      }
    }
    
    return info;
  });

  return {
    elements_with_resource_id: withResourceId.length,
    elements_without_resource_id: withoutResourceId.length,
    with_resource_id_details: withResourceIdWithSuggestions,
    missing_resource_id_details,
    elements_focused: elements.filter(e => e.attributes.focused).length,
    elements_not_focused: elements.filter(e => !e.attributes.focused).length
  };
} 