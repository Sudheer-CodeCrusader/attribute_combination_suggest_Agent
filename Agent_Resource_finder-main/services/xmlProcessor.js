import xml2js from 'xml2js';

// Helper function to generate XPath suggestions
function generateXPathSuggestions(element, allElements) {
  const suggestions = [];
  
  // Get element attributes
  const { attributes, xpath, tag } = element;
  
  // 1. Direct by exact text
  if (attributes.text && attributes.text.trim()) {
    const text = attributes.text.trim();
    suggestions.push({
      type: 'exact_text',
      xpath: `//${tag}[@text='${text}']`,
      description: `Direct match by exact text "${text}"`
    });
  }
  
  // 2. Using normalize-space for whitespace safety
  if (attributes.text && attributes.text.trim()) {
    const text = attributes.text.trim();
    suggestions.push({
      type: 'normalize_space',
      xpath: `//${tag}[normalize-space(.)='${text}']`,
      description: `Using normalize-space for whitespace safety`
    });
  }
  
  // 3. Scoped under parent containers
  const parentContainers = findParentContainers(element, allElements);
  if (parentContainers.length > 0) {
    parentContainers.forEach(container => {
      if (attributes.text && attributes.text.trim()) {
        const text = attributes.text.trim();
        suggestions.push({
          type: 'scoped_under_container',
          xpath: `${container.xpath}//${tag}[@text='${text}']`,
          description: `Scoped under ${container.tag} container`
        });
      }
    });
  }
  
  // 4. Relative to nearby labeled elements
  const relativeSuggestions = generateRelativeSuggestions(element, allElements);
  suggestions.push(...relativeSuggestions);
  
  // 5. Indexed suggestions for repeated elements
  const indexedSuggestions = generateIndexedSuggestions(element, allElements);
  suggestions.push(...indexedSuggestions);
  
  return suggestions;
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

// Helper function to generate relative suggestions
function generateRelativeSuggestions(element, allElements) {
  const suggestions = [];
  const { attributes, tag } = element;
  
  if (!attributes.text || !attributes.text.trim()) return suggestions;
  
  // Find nearby elements with descriptive text
  const nearbyElements = findNearbyElements(element, allElements);
  
  nearbyElements.forEach(nearby => {
    if (nearby.attributes.text && nearby.attributes.text.trim()) {
      const labelText = nearby.attributes.text.trim();
      const targetText = attributes.text.trim();
      
      suggestions.push({
        type: 'relative_to_label',
        xpath: `//${nearby.tag}[@text='${labelText}']/following-sibling::${tag}[1]`,
        description: `Relative to "${labelText}" label`
      });
      
      suggestions.push({
        type: 'relative_to_label_ancestor',
        xpath: `//${nearby.tag}[@text='${labelText}']/ancestor::*[1]//${tag}[@text='${targetText}']`,
        description: `Relative to "${labelText}" within same ancestor`
      });
    }
  });
  
  return suggestions;
}

// Helper function to find nearby elements
function findNearbyElements(element, allElements) {
  const nearby = [];
  const maxDistance = 3; // Look for elements within 3 levels
  
  allElements.forEach(other => {
    if (other.xpath === element.xpath) return;
    
    const elementLevel = element.xpath.split('/').length;
    const otherLevel = other.xpath.split('/').length;
    const levelDiff = Math.abs(elementLevel - otherLevel);
    
    if (levelDiff <= maxDistance && other.attributes.text && other.attributes.text.trim()) {
      nearby.push(other);
    }
  });
  
  return nearby.slice(0, 5); // Limit to 5 nearby elements
}

// Helper function to generate indexed suggestions
function generateIndexedSuggestions(element, allElements) {
  const suggestions = [];
  const { tag, attributes } = element;
  
  // Find similar elements (same tag and resource-id if available)
  const similarElements = allElements.filter(e => 
    e.tag === tag && 
    e.attributes['resource-id'] === attributes['resource-id']
  );
  
  if (similarElements.length > 1) {
    const index = similarElements.findIndex(e => e.xpath === element.xpath) + 1;
    
    if (attributes['resource-id']) {
      suggestions.push({
        type: 'indexed_with_resource_id',
        xpath: `(//${tag}[@resource-id='${attributes['resource-id']}'])[${index}]`,
        description: `Indexed element with resource-id (${index} of ${similarElements.length})`
      });
    } else {
      suggestions.push({
        type: 'indexed_by_tag',
        xpath: `(//${tag})[${index}]`,
        description: `Indexed element by tag (${index} of ${similarElements.length})`
      });
    }
  }
  
  // Generate parent-child indexed suggestions
  const parentChildSuggestions = generateParentChildIndexedSuggestions(element, allElements);
  suggestions.push(...parentChildSuggestions);
  
  return suggestions;
}

// Helper function to generate parent-child indexed suggestions
function generateParentChildIndexedSuggestions(element, allElements) {
  const suggestions = [];
  const { tag } = element;
  
  // Find parent containers
  const parentContainers = findParentContainers(element, allElements);
  
  parentContainers.forEach(container => {
    // Find all similar elements within this container
    const containerChildren = allElements.filter(e => 
      e.tag === tag && 
      e.xpath.startsWith(container.xpath) &&
      e.xpath !== container.xpath
    );
    
    if (containerChildren.length > 1) {
      const index = containerChildren.findIndex(e => e.xpath === element.xpath) + 1;
      
      suggestions.push({
        type: 'parent_child_indexed',
        xpath: `${container.xpath}//${tag}[${index}]`,
        description: `Indexed within ${container.tag} container (${index} of ${containerChildren.length})`
      });
    }
  });
  
  return suggestions;
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

  return {
    elements_with_resource_id: withResourceId.length,
    elements_without_resource_id: withoutResourceId.length,
    with_resource_id_details,
    missing_resource_id_details,
    elements_focused: elements.filter(e => e.attributes.focused).length,
    elements_not_focused: elements.filter(e => !e.attributes.focused).length
  };
} 