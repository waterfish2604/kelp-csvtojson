const fs = require("fs");
const readline = require("readline");

// Parse a single CSV line into an array, handling quotes
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // If we are inside quotes and next char is also a quote -> escaped quote ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip the next quote
      } else {
        // Toggle inQuotes
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      // Comma that is NOT inside quotes -> split here
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  // Push the last field
  result.push(current.trim());

  return result;
}

// Async generator that yields each CSV row as an array of values
async function* streamCsv(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue; // skip empty lines
    yield parseCsvLine(line);
  }
}

module.exports = { parseCsvLine, streamCsv };
