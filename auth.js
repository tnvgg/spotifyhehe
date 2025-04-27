const express = require('express');
const axios = require('axios');
const qs = require('querystring');

const app = express();
const port = 8888;

// Your credentials from Spotify
const client_id = '614fe39b9abb4cf38be5ffca0c8e0d9b'; // Replace with your Client ID
const client_secret = 'a1719e64ba9a4a179ba94d8f168b3764'; // Replace with your Client Secret
const redirect_uri = 'https://localhost:8888/callback'; // Same as your redirect URI

// Step 1: Redirect user to Spotify's login page
app.get('/login', (req, res) => {
  const scope = 'user-library-read user-read-playback-state user-modify-playback-state';
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}`
  );
});

// Step 2: Handle the redirect from Spotify after the user logs in
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;

    // Send tokens to browser or save for use in future requests
    res.send(`Access Token: ${access_token} <br> Refresh Token: ${refresh_token}`);
  } catch (error) {
    console.error(error);
    res.send('Error during authentication');
  }
});

app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
