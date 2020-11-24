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
      `/me/top/tracks?time_range=long_term&limit=10&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getArtistsTopList = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/me/top/artists?time_range=medium_term&limit=10&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getPlayingHistory = async () => {
  try {
    const response = await SpotifyAPI().get(
      `/me/player/recently-played?limit=20&after=1404811043508`
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
      `/browse/new-releases?country=TW&limit=10&offset=5`
    )
    return response
  } catch (e) {
    return e.response
  }
}

export const getFeaturedPlaylistsFn = async () => {
  try {
    const response = await SpotifyAPI().get(`/browse/featured-playlists`)
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

// const getNewReleases = (validateToken) => {
//   const url = `https://api.spotify.com/v1/browse/new-releases?country=TW&limit=10&offset=5`
//   axios
//     .get(url, {
//       method: "GET",
//       mode: "cors",
//       cache: "no-cache",
//       credentials: "same-origin",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${validateToken}`,
//       },
//       redirect: "follow",
//       referrerPolicy: "no-referrer",
//     })
//     .then(function (response) {
//       setNewReleaseData(response.data.albums.items)
//     })
//     .catch((err) => {
//       // Handle Error Here
//       console.error(err)
//     })
// }

// const getUserCurrentProfile = (validateToken) => {
//   const url = `https://api.spotify.com/v1/me`
//   axios
//     .get(url, {
//       method: "GET",
//       mode: "cors",
//       cache: "no-cache",
//       credentials: "same-origin",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${validateToken}`,
//       },
//       redirect: "follow",
//       referrerPolicy: "no-referrer",
//     })
//     .then(function (response) {
//       setUserProfile(response.data)
//     })
//     .catch((err) => {
//       // Handle Error Here
//       console.error(err)
//     })
// }

// const getRecommendList = (validateToken) => {
//   const url = `https://api.spotify.com/v1/recommendations?seed_genres=pop&min_energy=0.2&min_popularity=80&market=TW`
//   axios
//     .get(url, {
//       method: "GET",
//       mode: "cors",
//       cache: "no-cache",
//       credentials: "same-origin",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${validateToken}`,
//       },
//       redirect: "follow",
//       referrerPolicy: "no-referrer",
//     })
//     .then(function (response) {
//       setUserRecommendListData(response.data.tracks)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
// }

// const getFeaturedPlaylists = (validateToken) => {
//   const url = `https://api.spotify.com/v1/browse/featured-playlists`
//   axios
//     .get(url, {
//       method: "GET",
//       mode: "cors",
//       cache: "no-cache",
//       credentials: "same-origin",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${validateToken}`,
//       },
//       redirect: "follow",
//       referrerPolicy: "no-referrer",
//     })
//     .then(function (response) {
//       setFeaturedPlaylistsData(response.data.playlists.items)
//     })
//     .catch((err) => {
//       // Handle Error Here
//       console.error(err)
//     })
// }
