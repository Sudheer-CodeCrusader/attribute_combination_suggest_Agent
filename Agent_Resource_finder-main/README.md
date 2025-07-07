# Resource ID Identifier Agent

This API processes XML files and base64-encoded images to identify elements with missing resource IDs and provides intelligent XPath suggestions for better element identification.

## API Changes

The API has been updated to accept base64-encoded images instead of image URLs and now includes **XPath suggestion generation** for elements without resource IDs.

### Request Format

**Before:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "xml_url": "https://example.com/data.xml"
}
```

**After:**
```json
{
  "base64image": "iVBORw0KGgoAAAANSUhEUgAA...",
  "xml_url": "https://example.com/data.xml"
}
```

## API Endpoints

### POST /kickoff

Processes a base64 image and XML file to identify elements with missing resource IDs and generates XPath suggestions.

**Request Body:**
```json
{
  "base64image": "base64_encoded_image_string",
  "xml_url": "https://example.com/data.xml"
}
```

**Headers:**
```
Authorization: Bearer sudheertesttoken$%^
Content-Type: application/json
```

**Response:**
```json
{
  "kickoff_id": "uuid-string"
}
```

### GET /status/:kickoff_id

Retrieves the processing status and results for a given kickoff ID, including XPath suggestions.

**Headers:**
```
Authorization: Bearer sudheertesttoken$%^
```

**Response:**
```json
{
  "kickoff_id": "uuid-string",
  "data": {
    "elements_with_resource_id": 10,
    "elements_without_resource_id": 5,
    "elements_with_suggested_xpaths": 3,
    "missing_resource_id_details": [...],
    "suggested_xpath_examples": [
      {
        "original_xpath": "/hierarchy[1]/android.widget.FrameLayout[1]/androidx.viewpager.widget.ViewPager[1]/android.view.ViewGroup[1]/android.widget.ScrollView[1]/android.widget.TextView[1]",
        "text": "Rp1.000.000",
        "suggested_xpaths": [
          {
            "type": "exact_text",
            "xpath": "//android.widget.TextView[@text='Rp1.000.000']",
            "description": "Direct match by exact text \"Rp1.000.000\""
          },
          {
            "type": "scoped_under_container",
            "xpath": "//android.widget.ScrollView[@resource-id='com.pure.indosat.care:id/nestedScrollView']//android.widget.TextView[@text='Rp1.000.000']",
            "description": "Scoped under ScrollView container"
          },
          {
            "type": "parent_child_indexed",
            "xpath": "//android.widget.GridView[@resource-id='com.pure.indosat.care:id/rvRecommendedList']//android.widget.LinearLayout[1]",
            "description": "Indexed within GridView container (1 of 4)"
          }
        ]
      }
    ],
    "elements_focused": 2,
    "elements_not_focused": 13
  },
  "state": "SUCCESS"
}
```

## XPath Suggestion Types

The API now generates multiple types of XPath suggestions for elements without resource IDs:

### 1. **Exact Text Match**
```
//android.widget.TextView[@text='₹22,00,000']
```
Direct match by exact text content.

### 2. **Normalize-Space for Whitespace Safety**
```
//android.widget.TextView[normalize-space(.)='₹22,00,000']
```
Handles whitespace variations safely.

### 3. **Scoped Under Container**
```
//android.widget.ScrollView//android.widget.TextView[@text='₹22,00,000']
```
Confines search to specific container areas.

### 4. **Relative to Label**
```
//android.widget.TextView[@text='Loan Amount']/following-sibling::android.widget.TextView[1]
```
Finds elements relative to nearby labeled elements.

### 5. **Indexed Elements**
```
(//android.widget.LinearLayout[@resource-id='com.pure.indosat.care:id/constraintGrid'])[1]
```
Uses indexing for repeated elements with same resource-id.

### 6. **Parent-Child Indexed**
```
(//android.widget.GridView[@resource-id='com.pure.indosat.care:id/rvRecommendedList']//android.widget.LinearLayout)[1]
```
Indexed within specific parent containers.

## Base64 Image Format

The API accepts base64-encoded images in the following formats:

1. **Raw base64 string:**
   ```
   iVBORw0KGgoAAAANSUhEUgAA...
   ```

2. **Data URL format:**
   ```
   data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...
   ```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Error Handling

The API will return appropriate error messages for:

- Missing required fields (`base64image` or `xml_url`)
- Invalid base64 image data
- Unsupported image formats
- Invalid XML data
- Network errors when fetching XML

## Example Usage

### JavaScript/Node.js

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

// Convert image to base64
const imageBuffer = fs.readFileSync('image.jpg');
const base64Image = imageBuffer.toString('base64');

// Make API request
const response = await fetch('http://localhost:3000/kickoff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sudheertesttoken$%^'
  },
  body: JSON.stringify({
    base64image: base64Image,
    xml_url: 'https://example.com/data.xml'
  })
});

const result = await response.json();
console.log('Kickoff ID:', result.kickoff_id);

// Check status and get XPath suggestions
const statusResponse = await fetch(`http://localhost:3000/status/${result.kickoff_id}`, {
  headers: {
    'Authorization': 'Bearer sudheertesttoken$%^'
  }
});

const statusResult = await statusResponse.json();
console.log('XPath suggestions:', statusResult.data.suggested_xpath_examples);
```

### Python

```python
import requests
import base64

# Convert image to base64
with open('image.jpg', 'rb') as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

# Make API request
response = requests.post(
    'http://localhost:3000/kickoff',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sudheertesttoken$%^'
    },
    json={
        'base64image': base64_image,
        'xml_url': 'https://example.com/data.xml'
    }
)

result = response.json()
print('Kickoff ID:', result['kickoff_id'])

# Check status and get XPath suggestions
status_response = requests.get(
    f'http://localhost:3000/status/{result["kickoff_id"]}',
    headers={
        'Authorization': 'Bearer sudheertesttoken$%^'
    }
)

status_result = status_response.json()
print('XPath suggestions:', status_result['data']['suggested_xpath_examples'])
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The API will be available at `http://localhost:3000`

## Testing

### Basic API Test
Use the provided `test_base64_api.js` file to test the API:

1. Place a sample image file in the project directory
2. Update the `imagePath` variable in the test file
3. Update the `xml_url` to point to a valid XML file
4. Run the test:
   ```bash
   node test_base64_api.js
   ```

### XPath Suggestions Test
Use the new `test_xpath_suggestions.js` file to test XPath suggestion functionality:

```bash
node test_xpath_suggestions.js
```

This test uses the sample XML provided in the requirements and demonstrates all the XPath suggestion types.

## XPath Suggestion Features

- **Intelligent Analysis**: Analyzes XML structure to find reliable identification strategies
- **Multiple Strategies**: Generates different types of XPath suggestions for maximum reliability
- **Context Awareness**: Considers parent-child relationships and nearby elements
- **Indexing Support**: Handles repeated elements with proper indexing
- **Whitespace Safety**: Uses normalize-space for robust text matching
- **Container Scoping**: Suggests scoped searches within specific containers 