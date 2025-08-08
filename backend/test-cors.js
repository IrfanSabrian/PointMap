// Test CORS configuration
import fetch from 'node-fetch';

const testCors = async () => {
  const baseUrl = 'https://pointmap-production.up.railway.app';
  
  try {
    // Test OPTIONS request (preflight)
    const optionsResponse = await fetch(`${baseUrl}/api/bangunan/geojson`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://pointmap.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('OPTIONS Response Headers:');
    console.log('Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    
    // Test actual GET request
    const getResponse = await fetch(`${baseUrl}/api/bangunan/geojson`, {
      method: 'GET',
      headers: {
        'Origin': 'https://pointmap.vercel.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\nGET Response Status:', getResponse.status);
    console.log('GET Response Headers:');
    console.log('Access-Control-Allow-Origin:', getResponse.headers.get('Access-Control-Allow-Origin'));
    
  } catch (error) {
    console.error('Error testing CORS:', error);
  }
};

testCors();
