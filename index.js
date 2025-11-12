// index.js
// where your node app starts

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Enable CORS for FCC testing
app.use(cors({ optionsSuccessStatus: 200 }));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Temporary in-memory database
let urlDatabase = [];
let counter = 1;

// POST endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Parse and validate URL
  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // DNS lookup to validate host
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Store the URL
      const shortUrl = counter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const record = urlDatabase.find(obj => obj.short_url === shortUrl);

  if (record) {
    res.redirect(record.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
