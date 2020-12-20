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
