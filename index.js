require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = 5000;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

app.get("/token", async (req, res) => {
  try {
    const authBuffer = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: {
          Authorization: `Basic ${authBuffer}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
      }
    );

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to refresh token" });
  }
});
// Add this to index.js (if you want login via browser to generate a token)
app.get("/login", (req, res) => {
  const redirect_uri = "https://your-vercel-app-name.vercel.app/callback";
  const scope = "user-read-playback-state user-modify-playback-state";

  const authUrl =
    `https://accounts.spotify.com/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}`;

  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const redirect_uri = "https://your-vercel-app-name.vercel.app/callback";

  try {
    const authBuffer = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: {
          Authorization: `Basic ${authBuffer}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          code,
          redirect_uri,
          grant_type: "authorization_code",
        },
      }
    );

    // You can store these securely (for example, log the refresh token temporarily)
    console.log("Access Token:", response.data.access_token);
    console.log("Refresh Token:", response.data.refresh_token);

    res.send("Success! Check your server logs for refresh token.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error during token exchange.");
  }
});

app.listen(port, () => {
  console.log(`Spotify Token Server running at http://localhost:${port}`);
});
