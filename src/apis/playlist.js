import axios from "axios"
import { SpotifyAPI } from "./axios"

// const getPlayingHistory = (validateToken) => {
//   const url = `https://api.spotify.com/v1/me/player/recently-played?limit=20&after=1404811043508`
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
//       console.log(response, "history")
//       let cleanArray = response.data.items.filter(
//         (ele, ind) =>
//           ind ===
//           response.data.items.findIndex(
//             (elem) => elem.track.id === ele.track.id
//           )
//       )
//       setUserPlayedTracksListData(cleanArray)
//     })
//     .catch((err) => {
//       // Handle Error Here
//       console.error(err)
//     })
// }

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
