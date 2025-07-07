import fetch from 'node-fetch';
import fs from 'fs';

// Test function to demonstrate XPath suggestions
async function testXPathSuggestions() {
  const API_BASE_URL = 'http://localhost:3000';
  const AUTH_TOKEN = 'sudheertesttoken$%^';

  // Sample XML data (the one provided in the requirements)
  const sampleXml = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<hierarchy index="0" class="hierarchy" rotation="0" width="1080" height="2066">
  <android.widget.FrameLayout index="0" package="com.pure.indosat.care" class="android.widget.FrameLayout" text="" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[0,0][1080,2066]" displayed="true">
    <androidx.viewpager.widget.ViewPager index="0" package="com.pure.indosat.care" class="androidx.viewpager.widget.ViewPager" text="" resource-id="com.pure.indosat.care:id/vpMain" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[0,0][1080,2066]" displayed="true">
      <android.view.ViewGroup index="0" package="com.pure.indosat.care" class="android.view.ViewGroup" text="" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[0,0][1080,2066]" displayed="true">
        <android.widget.ImageView index="0" package="com.pure.indosat.care" class="android.widget.ImageView" text="" resource-id="com.pure.indosat.care:id/ivStart" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,45][158,113]" displayed="true" />
        <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="Reload Balance" resource-id="com.pure.indosat.care:id/tvText" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,56][1035,102]" displayed="true" />
        <android.widget.ImageView index="2" package="com.pure.indosat.care" class="android.widget.ImageView" text="" resource-id="com.pure.indosat.care:id/ivEnd" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[939,45][1007,113]" displayed="true" />
        <android.widget.ScrollView index="3" package="com.pure.indosat.care" class="android.widget.ScrollView" text="" resource-id="com.pure.indosat.care:id/nestedScrollView" checkable="false" checked="false" clickable="false" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="true" selected="false" bounds="[0,158][1080,2066]" displayed="true">
          <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="Recipient Number" resource-id="com.pure.indosat.care:id/tvRecipientTitle" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,203][1035,238]" displayed="true" />
          <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="Riyan" resource-id="com.pure.indosat.care:id/tvUserName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[214,283][294,318]" displayed="true" />
          <android.widget.TextView index="2" package="com.pure.indosat.care" class="android.widget.TextView" text="08151888689" resource-id="com.pure.indosat.care:id/tvUserNumber" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[214,326][456,382]" displayed="true" />
          <android.widget.TextView index="3" package="com.pure.indosat.care" class="android.widget.TextView" text="PREPAID" resource-id="com.pure.indosat.care:id/tvType" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[467,336][583,372]" displayed="true" />
          <android.widget.TextView index="4" package="com.pure.indosat.care" class="android.widget.TextView" text="Rp230" resource-id="com.pure.indosat.care:id/tvUserBalance" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[214,410][316,450]" displayed="true" />
          <android.widget.TextView index="5" package="com.pure.indosat.care" class="android.widget.TextView" text="valid until 04/06/2026" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[339,416][605,445]" displayed="true" />
          <android.widget.TextView index="6" package="com.pure.indosat.care" class="android.widget.TextView" text="Change" resource-id="com.pure.indosat.care:id/tvChangePhoneNumber" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[892,349][1001,384]" displayed="true" />
          <android.widget.TextView index="7" package="com.pure.indosat.care" class="android.widget.TextView" text="Select Amount" resource-id="com.pure.indosat.care:id/tvRecommended" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,597][278,637]" displayed="true" />
          <android.widget.GridView index="8" package="com.pure.indosat.care" class="android.widget.GridView" text="" resource-id="com.pure.indosat.care:id/rvRecommendedList" checkable="false" checked="false" clickable="false" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[28,682][1052,1183]" displayed="true">
            <android.widget.LinearLayout index="0" package="com.pure.indosat.care" class="android.widget.LinearLayout" text="" resource-id="com.pure.indosat.care:id/constraintGrid" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,682][518,1155]" displayed="true">
              <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="Your last reload in 30 days" resource-id="com.pure.indosat.care:id/tvDesc" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[51,691][419,747]" displayed="true" />
              <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="5.000" resource-id="com.pure.indosat.care:id/tvProductName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,781][444,839]" displayed="true" />
              <android.widget.TextView index="2" package="com.pure.indosat.care" class="android.widget.TextView" text="+7 days" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,850][201,893]" displayed="true" />
              <android.widget.TextView index="3" package="com.pure.indosat.care" class="android.widget.TextView" text="Rp7.000" resource-id="com.pure.indosat.care:id/tvPrice" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[74,1072][207,1112]" displayed="true" />
            </android.widget.LinearLayout>
          </android.widget.GridView>
          <android.widget.TextView index="9" package="com.pure.indosat.care" class="android.widget.TextView" text="Or choose different amount" resource-id="com.pure.indosat.care:id/tvOther" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[48,1219][429,1262]" displayed="true" />
          <android.widget.GridView index="10" package="com.pure.indosat.care" class="android.widget.GridView" text="" checkable="false" checked="false" clickable="false" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[28,1296][1052,2066]" displayed="true">
            <android.widget.LinearLayout index="0" package="com.pure.indosat.care" class="android.widget.LinearLayout" text="" resource-id="com.pure.indosat.care:id/constraintGrid" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,1296][523,1769]" displayed="true">
              <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="1.000.000" resource-id="com.pure.indosat.care:id/tvProductName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,1339][449,1397]" displayed="true" />
              <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="+120 days" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,1408][235,1451]" displayed="false" />
              <android.widget.TextView index="2" package="com.pure.indosat.care" class="android.widget.TextView" text="Rp1.000.000" resource-id="com.pure.indosat.care:id/tvPrice" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[74,1686][276,1726]" displayed="true" />
            </android.widget.LinearLayout>
            <android.widget.LinearLayout index="1" package="com.pure.indosat.care" class="android.widget.LinearLayout" text="" resource-id="com.pure.indosat.care:id/constraintGrid" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[557,1296][1035,1769]" displayed="true">
              <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="500.000" resource-id="com.pure.indosat.care:id/tvProductName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[597,1339][961,1397]" displayed="true" />
              <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="+120 days" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[597,1408][747,1451]" displayed="true" />
              <android.widget.TextView index="2" package="com.pure.indosat.care" class="android.widget.TextView" text="Rp500.000" resource-id="com.pure.indosat.care:id/tvPrice" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[586,1686][763,1726]" displayed="true" />
            </android.widget.LinearLayout>
            <android.widget.LinearLayout index="2" package="com.pure.indosat.care" class="android.widget.LinearLayout" text="" resource-id="com.pure.indosat.care:id/constraintGrid" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[45,1797][523,2066]" displayed="true">
              <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="300.000" resource-id="com.pure.indosat.care:id/tvProductName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,1840][449,1898]" displayed="true" />
              <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="+90 days" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[85,1909][218,1952]" displayed="true" />
            </android.widget.LinearLayout>
            <android.widget.LinearLayout index="3" package="com.pure.indosat.care" class="android.widget.LinearLayout" text="" resource-id="com.pure.indosat.care:id/constraintGrid" checkable="false" checked="false" clickable="true" enabled="true" focusable="true" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[557,1797][1035,2066]" displayed="true">
              <android.widget.TextView index="0" package="com.pure.indosat.care" class="android.widget.TextView" text="250.000" resource-id="com.pure.indosat.care:id/tvProductName" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[597,1840][961,1898]" displayed="true" />
              <android.widget.TextView index="1" package="com.pure.indosat.care" class="android.widget.TextView" text="+120 days" resource-id="com.pure.indosat.care:id/tvValidity" checkable="false" checked="false" clickable="false" enabled="true" focusable="false" focused="false" long-clickable="false" password="false" scrollable="false" selected="false" bounds="[597,1909][747,1952]" displayed="true" />
            </android.widget.LinearLayout>
          </android.widget.GridView>
        </android.widget.ScrollView>
      </android.view.ViewGroup>
    </androidx.viewpager.widget.ViewPager>
  </android.widget.FrameLayout>
</hierarchy>`;

  try {
    // Create a dummy image (base64 encoded 1x1 pixel)
    const dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    console.log('Testing XPath suggestions with sample XML...');
    
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/kickoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        base64image: dummyImage,
        xml_url: 'data:text/xml;base64,' + Buffer.from(sampleXml).toString('base64')
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('Success! Kickoff ID:', result.kickoff_id);

    // Test the status endpoint
    console.log('Checking status and XPath suggestions...');
    const statusResponse = await fetch(`${API_BASE_URL}/status/${result.kickoff_id}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      console.log('\n=== XPath Suggestions Analysis ===');
      console.log(`Elements with resource IDs: ${statusResult.data.elements_with_resource_id}`);
      console.log(`Elements without resource IDs: ${statusResult.data.elements_without_resource_id}`);
      console.log(`Elements with suggested XPaths: ${statusResult.data.elements_with_suggested_xpaths}`);
      
      if (statusResult.data.suggested_xpath_examples && statusResult.data.suggested_xpath_examples.length > 0) {
        console.log('\n=== Example XPath Suggestions ===');
        statusResult.data.suggested_xpath_examples.forEach((example, index) => {
          console.log(`\n${index + 1}. Element: "${example.text}"`);
          console.log(`   Original XPath: ${example.original_xpath}`);
          console.log('   Suggested XPaths:');
          example.suggested_xpaths.forEach((suggestion, sIndex) => {
            console.log(`     ${sIndex + 1}. ${suggestion.xpath}`);
            console.log(`        Type: ${suggestion.type}`);
            console.log(`        Description: ${suggestion.description}`);
          });
        });
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

console.log('XPath Suggestions Test');
console.log('Run this test to see the new XPath suggestion functionality:');
console.log('node test_xpath_suggestions.js');

export { testXPathSuggestions }; 