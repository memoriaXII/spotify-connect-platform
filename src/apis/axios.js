import axios from "axios"

export const SpotifyAPI = (options, baseURL) => {
  const authorizationToken = localStorage.getItem("spotifyAuthToken", null)
  const { REACT_APP_SPOTIFY_API_URL } = process.env

  return axios.create({
    baseURL: REACT_APP_SPOTIFY_API_URL,
    headers: {
      Authorization: `Bearer ${authorizationToken}`,
      "Content-Type": "application/json",
      ...options,
    },
  })
}
