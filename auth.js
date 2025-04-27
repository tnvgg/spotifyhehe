const express = require('express');
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 8888;

// Set up SSL certificate paths
const options = {
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.crt')
};

// Spotify API credentials from .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://localhost:8888/callback';

// Step 1: Redirect user to Spotify Accounts service
app.get('/login', (req, res) => {
  const scope = 'user-library-read user-read-private';
  const authUrl = `https://accounts.spotify.com/authorize?${qs.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scope
  })}`;
  res.redirect(authUrl);
});

// Step 2: Handle the callback from Spotify and get the access token
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  // Exchange code for an access token
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token } = response.data;
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);

    // Redirect user to a success page or home page
    res.send('Login successful! You can now access your Spotify data.');
  } catch (error) {
    console.error('Error getting access token:', error);
    res.send('Error during authentication. Please try again.');
  }
});

// Create HTTPS server and listen on the specified port
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
