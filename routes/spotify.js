require("dotenv").config();
const util = require("../util/util");
const express = require("express");
const querystring = require("querystring");
const request = require("request");
const spotifyRouter = express.Router();

const backendUrl =
  process.env.NODE_ENV === "production"
    ? "https://musicnexusbackend.vercel.app"
    : "http://localhost:3000";

const url =
  process.env.NODE_ENV === "production"
    ? "https://musicnexus.vercel.app"
    : "http://localhost:3001";

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSECRET = process.env.SPOTIFY_CLIENT_SECRET;

const redirect_uri =
  process.env.NODE_ENV === "production"
    ? "https://musicnexusbackend.vercel.app/spotify/callback"
    : "http://localhost:3000/spotify/callback";

spotifyRouter.get("/login", function (req, res) {
  const state = util.generateRandomString(16);
  const scope =
    "user-read-private user-read-email user-follow-read user-top-read user-read-recently-played playlist-read-private streaming user-read-playback-state user-modify-playback-state";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: clientID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

spotifyRouter.get("/callback", function (req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(clientID + ":" + clientSECRET).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const access_token = body.access_token;
        const expires_in = body.expires_in;

        req.session.access_token = access_token;
        req.session.expires_at = Date.now() + expires_in * 1000;

        res.redirect(url + "/home");
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

module.exports = spotifyRouter;
