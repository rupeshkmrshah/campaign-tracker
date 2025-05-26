// const express = require('express');
// const fetch = require('node-fetch'); // If using Node 18+, use global fetch
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));

// // API to resolve final URL
// app.get('/resolve', async (req, res) => {
//   const { url } = req.query;
//   if (!url) return res.status(400).json({ error: 'Missing URL' });

//   try {
//     const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
//     res.json({ finalUrl: response.url });
//   } catch (err) {
//     console.error(err);
//     res.json({ finalUrl: 'Could not resolve' });
//   }
// });

// // Serve index.html for root path
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


// Import node-fetch using ES Module syntax
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API to resolve final URL and extract campaign parameters
app.get('/resolve', async (req, res) => {
  const { url: inputUrl } = req.query;
  if (!inputUrl) return res.status(400).json({ error: 'Missing URL' });

  try {
    // Parse the input URL to extract UTM parameters
    const parsedUrl = new URL(inputUrl);
    const campaignParams = {
      utm_source: parsedUrl.searchParams.get('utm_source') || null,
      utm_medium: parsedUrl.searchParams.get('utm_medium') || null,
      utm_campaign: parsedUrl.searchParams.get('utm_campaign') || null,
      utm_term: parsedUrl.searchParams.get('utm_term') || null,
      utm_content: parsedUrl.searchParams.get('utm_content') || null
    };

    // Follow redirects to get the final URL
    const response = await fetch(inputUrl, { 
      method: 'HEAD', 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CampaignTracker/1.0)'
      }
    });

    // Return both the final URL and campaign parameters
    res.json({
      originalUrl: inputUrl,
      finalUrl: response.url,
      campaignParams
    });
  } catch (err) {
    console.error('Error resolving URL:', err);
    res.status(500).json({ 
      error: 'Could not resolve URL',
      details: err.message 
    });
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});