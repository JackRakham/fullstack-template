// Load environment variables before anything else
require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

/**
 * Script for extracting OpenAPI schema from a running backend instance.
 * This is more robust than bootstrapping the app in a script.
 */
async function fetchSchema() {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/api/docs-json`;
  const outputPath = path.resolve(__dirname, '../../schema/openapi.json');
  const outputDir = path.dirname(outputPath);

  console.log(`🚀 Fetching OpenAPI schema from: ${url}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  http.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`❌ Failed to fetch schema. Status Code: ${res.statusCode}`);
      process.exit(1);
    }

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        // Validate JSON
        JSON.parse(data);
        fs.writeFileSync(outputPath, data);
        console.log(`✅ OpenAPI schema saved to: ${outputPath}`);
        process.exit(0);
      } catch (e) {
        console.error('❌ Failed to parse schema as JSON');
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error fetching schema:', err.message);
    console.error('💡 Is the backend running? (npm run start:dev)');
    process.exit(1);
  });
}

fetchSchema();
