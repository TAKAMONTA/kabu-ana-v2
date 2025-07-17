console.log('🧪 Testing new Gemini API key...');

const API_KEY = 'AIzaSyCfXYwHZVsD1ImT10afpux8I-6dwwa8ZI4';

async function testGeminiApiKey() {
  try {
    console.log('📡 Making test API call to Gemini...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test message - please respond with "API key is working"'
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Gemini API key is valid!');
      console.log('📝 Response:', data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response');
      return true;
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

testGeminiApiKey().then(success => {
  if (success) {
    console.log('🎉 New Gemini API key is working correctly!');
  } else {
    console.log('💥 New Gemini API key test failed');
  }
});
