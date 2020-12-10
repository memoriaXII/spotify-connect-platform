import axios from "axios"
import { SpotifyAPI } from "./axios"

export const getAllPlayLists = async () => {
  try {
    const response = await SpotifyAPI().get(`/me/playlists?offset=0&limit=20`)
    return response
  } catch (e) {
    return e.response
  }
}

export const getTracksTopList = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/me/top/tracks?time_range=long_term&limit=20&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getArtistsTopList = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/me/top/artists?time_range=medium_term&limit=30&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getPlayingHistory = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/me/player/recently-played?limit=50&after=1404811043508`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getCategories = async () => {
  try {
    const response = await SpotifyAPI().get(`/browse/categories`)
    return response
  } catch (e) {
    return e.response
  }
}

export const getTop50TracksList = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getViral50TracksList = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/playlists/37i9dQZEVXbLiRSasKsNU9/tracks`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getNewReleasesFn = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/browse/new-releases?country=TW&limit=20&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getFeaturedPlaylistsFn = async () => {
  try {
    const response = await SpotifyAPI().get(`/users/spotify/playlists`)
    return response
  } catch (e) {
    return e.response
  }
}

export const getUserRecommendListFn = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/recommendations?seed_genres=pop&min_energy=0.2&min_popularity=80&market=TW`
    )
    return response
  } catch (e) {
    return e.response
  }
}
