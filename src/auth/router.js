'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const path = require('path');

const authRouter = express.Router();
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const client_id = process.env.CLIENT_ID,
      client_secret = process.env.CLIENT_SECRET,
      redirect_uri = process.env.REDIRECT_URI;

const scopes = [ //needs trimmed to only necessary ones
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: client_id,
  clientSecret: client_secret,
});

authRouter.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

authRouter.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send('Success! You can now close the window.');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

authRouter.get('/top-tracks', (req, res) => {
  spotifyApi.getMyTopTracks()
  .then(function(data) {
    let topTracks = data.body.items;
    console.log('top tracks: ', topTracks);
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});


authRouter.get('/top-artists', (req, res) => {
  spotifyApi.getMyTopArtists()
  .then(function(data) {
    let topArtists = data.body.items;
    console.log('top artsis: ', topArtists);
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});


module.exports = authRouter;