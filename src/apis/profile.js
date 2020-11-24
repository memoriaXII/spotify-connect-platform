import axios from "axios"
import { SpotifyAPI } from "./axios"

export const getUserCurrentProfileFn = async () => {
  try {
    const response = await SpotifyAPI().get(`/me`)
    return response
  } catch (e) {
    return e.response
  }
}
