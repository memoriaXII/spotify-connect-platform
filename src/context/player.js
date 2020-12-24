/** @format */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"
import { useHistory, useLocation } from "react-router-dom"
import queryString from "query-string"
import { usePrevious } from "../utils/customHook"
import axios from "axios"

import ColorThief from "colorthief"
import { useWindowDimensions } from "../utils/customHook"
import { AuthContext } from "../context/auth"

export const PlayerContext = createContext({})

export const PlayerProvider = (props) => {
  const { getToken, isLoggedIn } = useContext(AuthContext)
  var syncTimeout
  const { deviceWidth, deviceHeight } = useWindowDimensions()
  const imgRef = useRef(null)
  const height = 380
  let player = null
  let emptyTrack = {
    artists: "",
    durationMs: 0,
    id: "",
    image: "",
    name: "",
    uri: "",
  }
  const location = useLocation()
  const history = useHistory()
  const [isSeeking, setIsSeeking] = useState(false)
  const [leftScrollStatus, setLeftScrollStatus] = useState(false)
  const [rightScrollStatus, setRightScrollStatus] = useState(false)
  const [chartPlayListData, setChartPlayListData] = useState([])
  const [chartAlbumData, setChartAlbumData] = useState([])
  const [chartArtistData, setChartArtistData] = useState([])
  const [sidePlayListData, setSidePlayListData] = useState([])
  const [cachedAlbumsArray, setCachedAlbumsArray] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userCurrentPlayingTrack, setUserCurrentPlayingTrack] = useState({})
  const [userRecommendListData, setUserRecommendListData] = useState([])
  const [currentPlayingState, setCurrentPlayingState] = useState({})

  const authToken = getToken()

  const ref = useRef(null)
  const scrollContainer = useRef(null)
  const [userCustomState, setUserCustomState] = useState({
    autoPlay: true,
    offset: 0,
    syncExternalDevice: true,
    uris: ["spotify:track:0gkVD2tr14wCfJhqhdE94L"],
  })

  const [globalState, updateGlobalState] = useState({
    currentDeviceId: "",
    deviceId: "",
    devices: [],
    error: "",
    errorType: "",
    isActive: false,
    isInitializing: false,
    isMagnified: false,
    isPlaying: false,
    isRepeated: false,
    isSaved: false,
    isShuffled: false,
    isUnsupported: false,
    needsUpdate: false,
    nextTracks: [],
    position: 0,
    previousTracks: [],
    status: false,
    track: {},
    contextUrl: "",
  })

  const [testText, setTestText] = useState("")

  const [progressBar, setProgressBar] = useState({
    position: 0,
    progressMs: 0,
  })

  const [volumeBar, setVolumeBar] = useState({
    volume: 0,
  })

  const prevState = usePrevious(globalState)
  const prevCustomState = usePrevious(userCustomState)
  const progressBarStyles = {
    width:
      globalState && globalState.track
        ? (globalState.progressMs * 100) / globalState.track.durationMs + "%"
        : null,
  }

  function getSpotifyURIType(uri) {
    const [, type = ""] = uri.split(":")
    return type
  }

  async function getPlaybackState(token) {
    return fetch(
      `https://api.spotify.com/v1/me/player?market=TW&additional_types=episode`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    ).then((d) => {
      if (d.status == 204) {
        AutoQueue(authToken, globalState.currentDeviceId)
        return
      } else if (d.status == 401) {
        localStorage.removeItem("spotifyAuthToken")
        history.push("/login")
      }
      return d.json()
    })
  }

  async function getCurrentPlaying(token) {
    const url = `https://api.spotify.com/v1/me/player/currently-playing?market=TW&additional_types=episode`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {})
      .catch((err) => {
        console.error(err)
      })
  }

  async function setVolume(validateToken, volume, deviceID) {
    return fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${deviceID}`,
      {
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    )
  }

  const syncDevice = async (validateToken) => {
    try {
      const player = await getPlaybackState(validateToken)
      let track = emptyTrack
      if (!player) {
        throw new Error("No player")
      }

      if (player.currently_playing_type == "track") {
        if (player.item) {
          track = {
            album: player.item.album,
            artistsArray: player.item.artists,
            artists: player.item.artists.map((d) => d.name).join(", "),
            durationMs: player.item.duration_ms,
            id: player.item.id,
            image: player.item.album.images[0].url,
            name: player.item.name,
            uri: player.item.uri,
          }
        }
        updateGlobalState({
          contextUrl: player.context ? player.context.uri : "",
          error: "",
          errorType: "",
          isActive: true,
          isRepeated: player.repeat_state == "track" ? true : false,
          isShuffled: player.shuffle_state,
          isPlaying: player.is_playing,
          nextTracks: [],
          previousTracks: [],
          status: true,
          track: track,
          currentDeviceId: player.device.id,
        })
        setVolumeBar({
          volume: player.device.volume_percent / 100,
        })
        setProgressBar({
          position: Number(
            ((player.progress_ms / track.durationMs) * 100).toFixed(1)
          ),
          progressMs: player.item ? player.progress_ms : 0,
        })
        return
      } else if (player.currently_playing_type == "episode") {
        updateGlobalState({
          track: {
            name: player.item.name,
            artistsArray: [
              { name: player.item.show.name, id: player.item.show.id },
            ],
            id: player.item.id,
            image: player.item.images[0].url,
            uri: player.item.uri,
            durationMs: player.item.duration_ms,
            showUri: player.item.show.uri,
          },
          isShuffled: player.shuffle_state,
          isPlaying: player.is_playing,
          currentDeviceId: player.device.id,
        })
        setVolumeBar({
          volume: player.device.volume_percent / 100,
        })
        setProgressBar({
          position: Number(
            ((player.progress_ms / player.item.duration_ms) * 100).toFixed(1)
          ),
          progressMs: player ? player.progress_ms : 0,
        })
      }
      return
    } catch (error) {}
  }

  const isExternalPlayer = (data) => {
    const { currentDeviceId, deviceId, status } = globalState
    return currentDeviceId && currentDeviceId !== deviceId
  }

  async function getDevices(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/devices`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    }).then((d) => d.json())
  }

  const handlePlayerStatus = async ({ device_id }) => {
    const { currentDeviceId, devices } = await initializeDevices(device_id)
    updateGlobalState({
      currentDeviceId: currentDeviceId,
      deviceId: device_id,
      devices: devices,
      isInitializing: false,
      status: device_id ? true : false,
    })
  }

  const initializeDevices = async (id) => {
    const { devices } = await getDevices(authToken)
    let currentDeviceId = id
    const savedDeviceId = sessionStorage.getItem("rswpDeviceId")
    if (devices) {
      if (!savedDeviceId || !devices.find((d) => d.id === savedDeviceId)) {
        sessionStorage.setItem("rswpDeviceId", currentDeviceId)
      } else {
        currentDeviceId = savedDeviceId
      }
    }

    return { currentDeviceId, devices }
  }

  const handlePlayerStateChanges = async (state) => {
    try {
      /* istanbul ignore else */
      if (state) {
        setCachedAlbumsArray([
          ...state.track_window.previous_tracks,
          state.track_window.current_track,
          ...state.track_window.next_tracks,
        ])
        const isPlaying = !state.paused
        const {
          album,
          artists,
          duration_ms,
          id,
          name,
          uri,
        } = state.track_window.current_track

        const track = {
          artists: artists.map((d) => d.name).join(", "),
          durationMs: duration_ms,
          id,
          image: album && album.images[0].url,
          name,
          uri,
        }
        updateGlobalState({
          isActive: true,
          isPlaying: isPlaying,
          nextTracks: state.track_window.next_tracks,
          previousTracks: state.track_window.previous_tracks,
          track: track,
          // contextUrl: state.context.uri,
        })
        setProgressBar({
          position: state.position,
          // ...progressBar,
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const initializePlayer = (validateToken) => {
    window.onSpotifyWebPlaybackSDKReady = () => {}
    async function waitForSpotifyWebPlaybackSDKToLoad() {
      return new Promise((resolve) => {
        if (window.Spotify) {
          resolve(window.Spotify)
        } else {
          window.onSpotifyWebPlaybackSDKReady = () => {
            resolve(window.Spotify)
          }
        }
      })
    }
    async function waitUntilUserHasSelectedPlayer(sdk) {
      return new Promise((resolve) => {
        let interval = setInterval(async () => {
          let state = await sdk.getCurrentState()
          if (state !== null) {
            resolve(state)
            clearInterval(interval)
          }
        })
      })
    }
    ;(async () => {
      const { Player } = await waitForSpotifyWebPlaybackSDKToLoad()
      player = new Player({
        name: "Spotify Connect Player",
        volume: 0.6,
        getOAuthToken: (callback) => {
          callback(validateToken)
        },
      })
      player.getCurrentState().then((state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          )
          return
        }
      })
      player.addListener("ready", handlePlayerStatus)
      player.addListener("not_ready", handlePlayerStatus)
      player.addListener("player_state_changed", handlePlayerStateChanges)
      player.addListener("initialization_error", (error) => {
        console.log(error, "error")
      })
      player.addListener("authentication_error", (error) => {
        console.log(error, "error")
      })
      player.addListener("account_error", (error) => {
        console.log(error, "error")
      })
      player.addListener("playback_error", (error) => {
        console.log(error, "error")
      })
      player.connect()
    })()
  }

  async function seek(validateToken, position) {
    return await fetch(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${position}`,
      {
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    )
  }

  const handleChangeRange = useCallback(
    async (position) => {
      const { track } = globalState
      try {
        const percentage = position / 100
        if (percentage) {
          await setProgressBar({
            position: position,
            progressMs: Math.round(track.durationMs * percentage),
          })
          await seek(authToken, Math.round(track.durationMs * percentage))
        } else if (player) {
          const state = await player.getCurrentState()
          if (state) {
            await player.seek(
              Math.round(
                state.track_window.current_track.duration_ms * percentage
              )
            )
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    [globalState, progressBar]
  )

  const setDeviceVolume = async (volume, deviceId) => {
    if (!player) {
      await setVolume(authToken, Math.round(volume * 100), deviceId)
    } else if (player) {
      await player.setVolume(volume)
    }

    setVolumeBar({
      volume: volume,
    })
  }

  async function AutoQueue(validateToken, id) {
    let body = JSON.stringify({
      device_ids: [id],
      play: true,
    })
    return fetch(`https://api.spotify.com/v1/me/player`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      body,
      method: "PUT",
    }).then((d) => {
      if (d.status == 403) {
        getCurrentPlaying(validateToken)
        return
      }
      // return d.json()
    })
  }

  // useEffect(() => {
  //   let parsed = queryString.parse(window.location.search)
  //   const token = parsed.access_token
  //   if (token) {
  //     setAuthToken(token)
  //     localStorage.setItem("spotifyAuthToken", token)
  //     history.push(`/`)
  //   } else if (getToken()) {
  //     setAuthToken(getToken())
  //   }
  // }, [])

  useLayoutEffect(() => {
    if (authToken) {
      initializePlayer(authToken)
    }
    return () => (player ? player.disconnect() : "")
  }, [authToken])

  const playFn = async (
    validateToken,
    id,
    uri,
    artistUris,
    contextUri,
    offset = 0
  ) => {
    const parsedValues = {
      artistSongs:
        artistUris && artistUris.map((x) => (x.track ? x.track.uri : x.uri)),
    }
    let body
    const { artistSongs } = parsedValues
    if (artistUris) {
      body = JSON.stringify({ uris: artistSongs, offset: { position: 0 } })
    }
    if (uri) {
      body = JSON.stringify({ uris: [uri], offset: { position: 0 } })
    }
    if (contextUri) {
      body = JSON.stringify({
        context_uri: contextUri,
        offset: { position: 0 },
      })
    }
    return await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${id}`,
      {
        body,
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    )
  }

  const pauseFn = async (validateToken) => {
    return fetch(`https://api.spotify.com/v1/me/player/pause`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
  }

  useLayoutEffect(() => {
    if (isLoggedIn && getToken() && globalState) {
      syncTimeout = setInterval(() => {
        syncDevice(getToken())
      }, 800)
      return () => clearInterval(syncTimeout)
    }
  }, [getToken(), globalState])

  return (
    <PlayerContext.Provider
      value={{
        testText,
        volumeBar,
        setIsSeeking,
        syncTimeout,
        updateGlobalState,
        setDeviceVolume,
        globalState,
        progressBar,
        playFn,
        pauseFn,
        handleChangeRange,
      }}
    >
      <>{props.children}</>
    </PlayerContext.Provider>
  )
}
