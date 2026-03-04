const http = require('http');

async function testBackend() {
  const PORT = process.env.PORT || 3000;
  const url = `http://localhost:${PORT}/api/info`;

  console.log(`Testing backend at ${url}...`);

  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${statusCode}`));
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          console.log('Backend response:', parsedData);
          if (parsedData.port && parsedData.ip) {
            console.log('✅ Backend test passed!');
            resolve(true);
          } else {
            reject(new Error('Invalid response structure'));
          }
        } catch (e) {
          reject(new Error(`Parsing failed: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Got error: ${e.message}`));
    });
  });
}

testBackend().catch(err => {
  console.error('❌ Backend test failed:', err.message);
  process.exit(1);
});
