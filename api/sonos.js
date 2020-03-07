const client = require("../db");
const fetch = require("node-fetch");
const { getAccessTokenFromDBorRefreshToken } = require("./auth_sonos");

async function togglePlayPause(room, command, user) {
  const endpoint = `groups/${room}/playback/${command}`;
  const body = {};
  try {
    const response = await baseSonosApiRequest({
      endpoint,
      method: "POST",
      body: JSON.stringify(body),
      user
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}

async function startPlayback(room, playlist, user) {
  const endpoint = `groups/${room}/playlists`;
  const body = {
    playlistId: playlist.toString(),
    playOnCompletion: true
  };
  try {
    const response = await baseSonosApiRequest({
      endpoint,
      method: "POST",
      body: JSON.stringify(body),
      user
    });
    return response;
  } catch (err) {
    console.log("error", err);
  }
}

async function baseSonosApiRequest({ endpoint, method, body, user }) {
  try {
    let url = `https://api.ws.sonos.com/control/api/v1/${endpoint}`;
    const { accessToken } = await getAccessTokenFromDBorRefreshToken(user);

    const headers = {
      "Content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Host: "api.ws.sonos.com"
    };

    return fetch(url, {
      headers,
      method,
      body
    });
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  startPlayback,
  togglePlayPause,
  baseSonosApiRequest
};
