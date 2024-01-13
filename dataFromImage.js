const tesseract = require('tesseract.js');

async function extractTextFromImage() {
 
    const text = await tesseract.recognize('./image.png');

    const lines = text.data.text.trim().split('\n');

    const results = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Limit Buy")) {
        const parts = line.split(' ');
        const pair = parts[1];
        const type = parts[2];
        const action = parts[3];
        const price = parts[4];
        const quantity = parts[6];
        const ticker = parts[7];
        const status = parts[9] ? parts[9] : parts[8];
        results.push({
          pair,
          type,
          action,
          price,
          quantity,
          ticker,
          status
        });
      }
    }
    
    //store it in the DB
   return results;

  }
  
  module.exports = {extractTextFromImage}