const express = require('express');
const cors = require('cors');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 8888;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API to resolve final URL
app.get('/resolve', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new', // or true in older Puppeteer versions
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2', // waits until network is quiet (best for dynamic pages)
      timeout: 15000
    });

    await sleep(2000); //wait for 2 mintues

    const finalUrl = page.url(); // actual final resolved URL after JS redirects
    res.json({ finalUrl });
  } catch (err) {
    console.error('Puppeteer error:', err.message);
    res.status(500).json({ error: 'Failed to resolve final URL', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
