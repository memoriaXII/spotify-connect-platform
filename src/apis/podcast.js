import axios from "axios"
import { SpotifyAPI } from "./axios"

export const getUserCurrentPodCastPlaylist = async () => {
  try {
    const response = await SpotifyAPI().get(`/me/shows`)
    return response
  } catch (e) {
    return e.response
  }
}
