import axios from "axios"
import { SpotifyAPI } from "./axios"

export const previousFn = async () => {
  try {
    const response = await SpotifyAPI.post("/me/player/previous")
    return response
  } catch (e) {
    return e.response
  }
}

export const nextFn = async () => {
  try {
    const response = await SpotifyAPI.post("/me/player/next")
    console.log(response, "response")
    return response
  } catch (e) {
    return e.response
  }
}

export const pauseFn = async () => {
  try {
    const response = await SpotifyAPI.put("/me/player/pause")
    return response
  } catch (e) {
    return e.response
  }
}

// async function previousFn(validateToken) {
//   return fetch(`https://api.spotify.com/v1/me/player/previous`, {
//     headers: {
//       Authorization: `Bearer ${validateToken}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//   })
// }
// async function nextFn(validateToken) {
//   return fetch(`https://api.spotify.com/v1/me/player/next`, {
//     headers: {
//       Authorization: `Bearer ${validateToken}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//   })
// }
