const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const lyricsFinder = require("lyrics-finder");
const SpotifyWebApi = require("spotify-web-api-node");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Spotify Web API with credentials
const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});

// Route to handle token refresh
app.post("/refresh", async(req, res) => {
    const refreshToken = req.body.refreshToken;

    try {
        const data = await spotifyApi.refreshAccessToken();
        const accessToken = data.body.access_token;
        const expiresIn = data.body.expires_in;
        res.json({
            accessToken: accessToken,
            expiresIn: expiresIn,
        });
    } catch (error) {
        console.log("Error refreshing token:", error);
        res.sendStatus(400);
    }
});

// Route to handle user login
app.post("/login", (req, res) => {
    const code = req.body.code;

    spotifyApi
        .authorizationCodeGrant(code)
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            });
        })
        .catch((err) => {
            console.error("Error logging in:", err);
            res.sendStatus(400);
        });
});

// Route to fetch lyrics
app.get("/lyrics", async(req, res) => {
    const lyrics =
        (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found";
    res.json({ lyrics });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});