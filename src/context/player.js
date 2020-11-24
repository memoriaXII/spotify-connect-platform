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
import queryString from "query-string"
import { usePrevious } from "../utils/customHook"
import { useLocation } from "react-router-dom"

import ColorThief from "colorthief"
import { useWindowDimensions } from "../utils/customHook"

export const PlayerContext = createContext({})

export const PlayerProvider = (props) => {
  var syncTimeout
  const { deviceWidth, deviceHeight } = useWindowDimensions()
  const imgRef = useRef(null)
  const height = 380
  var playerSyncInterval = 5
  var playerProgressInterval = 5
  var seekUpdateInterval = 100
  var intervalId2
  var intervalId
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

  const [leftScrollStatus, setLeftScrollStatus] = useState(false)
  const [rightScrollStatus, setRightScrollStatus] = useState(false)
  const [chartPlayListData, setChartPlayListData] = useState([])
  const [chartAlbumData, setChartAlbumData] = useState([])
  const [chartArtistData, setChartArtistData] = useState([])
  const [authToken, setAuthToken] = useState("")
  const [sidePlayListData, setSidePlayListData] = useState([])
  const [cachedAlbumsArray, setCachedAlbumsArray] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userCurrentPlayingTrack, setUserCurrentPlayingTrack] = useState({})
  const [userRecommendListData, setUserRecommendListData] = useState([])
  const [currentPlayingState, setCurrentPlayingState] = useState({})
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
    isSaved: false,
    isUnsupported: false,
    needsUpdate: false,
    nextTracks: [],
    position: 0,
    previousTracks: [],
    status: false,
    track: {},
    volume: 1,
    contextUrl: "",
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
    return fetch(`https://api.spotify.com/v1/me/player`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    }).then((d) => {
      if (d.status === 204) {
        AutoQueue(authToken, globalState.currentDeviceId)
        return
      } else if (d.status === 401) {
        localStorage.removeItem("spotifyAuthToken")
      }

      return d.json()
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
      if (player.item) {
        track = {
          album: player.item.album,
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
        isPlaying: player.is_playing,
        nextTracks: [],
        previousTracks: [],
        progressMs: player.item ? player.progress_ms : 0,
        status: true,
        track: track,
        volume: player.device.volume_percent / 100,
        currentDeviceId: player.device.id,
        position: Number(
          ((player.progress_ms / track.durationMs) * 100).toFixed(1)
        ),
      })
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
        // let {
        //   current_track,
        //   next_tracks: [next_track],
        // } = state.track_window

        console.log("Currently Playing", state.track_window)
        // console.log([
        //   ...state.track_window.previous_tracks,
        //   ...state.track_window.next_tracks,
        // ])

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
        // const volume = await player.getVolume()

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
          contextUrl: state.context.uri,
          position: state.position,
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
        name: "Rex web player",
        volume: 1.0,
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
      player.addListener(
        "initialization_error",
        (error) => {
          console.log(error, "error")
        }
        // handlePlayerErrors("initialization_error", error.message)
      )
      player.addListener(
        "authentication_error",
        (error) => {
          console.log(error, "error")
        }
        // handlePlayerErrors("authentication_error", error.message)
      )
      player.addListener(
        "account_error",
        (error) => {
          console.log(error, "error")
        }
        // handlePlayerErrors("account_error", error.message)
      )
      player.addListener(
        "playback_error",
        (error) => {
          console.log(error, "error")
        }
        // handlePlayerErrors("playback_error", error.message)
      )
      player.connect()
    })()
  }

  async function seek(validateToken, position) {
    return fetch(
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

  const handleChangeRange = async (position) => {
    const { track } = globalState
    try {
      const percentage = position / 100

      if (isExternalPlayer) {
        await seek(authToken, Math.round(track.durationMs * percentage))
        updateGlobalState({
          position,
          progressMs: Math.round(track.durationMs * percentage),
          ...globalState,
        })
      } else if (player) {
        const state = await player.getCurrentState()

        if (state) {
          await player.seek(
            Math.round(
              state.track_window.current_track.duration_ms * percentage
            )
          )
        } else {
          updateGlobalState({ position: 0, ...globalState })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const setDeviceVolume = async (volume, deviceId) => {
    if (isExternalPlayer) {
      await setVolume(authToken, Math.round(volume * 100), deviceId)
    } else if (player) {
      await player.setVolume(volume)
    }
    updateGlobalState({
      volume: volume,
      ...globalState,
    })
  }

  const toggleSyncInterval = async (shouldSync) => {
    try {
      if (isExternalPlayer && shouldSync && playerSyncInterval == undefined) {
      }
      if ((!shouldSync || !isExternalPlayer) && playerSyncInterval) {
        clearInterval(playerSyncInterval)
        playerSyncInterval = undefined
      }
    } catch (error) {
      console.error(error)
    }
  }

  const toggleProgressBar = () => {
    const { isPlaying } = globalState

    if (isPlaying) {
      /* istanbul ignore else */
      if (!playerProgressInterval) {
        playerProgressInterval = window.setInterval(
          updateSeekBar,
          seekUpdateInterval
        )
      }
    } else if (playerProgressInterval) {
      clearInterval(playerProgressInterval)
      playerProgressInterval = undefined
    }
  }

  const updateSeekBar = async () => {
    const { progressMs, track } = globalState
    // alert(isExternalPlayer)
    try {
      /* istanbul ignore else */
      if (isExternalPlayer) {
        let position = progressMs / track.durationMs
        position = Number.isFinite(position) ? position : 0
        updateGlobalState({
          position: Number((position * 100).toFixed(1)),
          progressMs: progressMs + seekUpdateInterval,
          ...globalState,
        })
      } else if (player) {
        const state = await player.getCurrentState()

        /* istanbul ignore else */
        if (state) {
          const position =
            state.position / state.track_window.current_track.duration_ms
          updateGlobalState({
            position: Number((position * 100).toFixed(1)),
            ...globalState,
          })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
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
    })
  }

  useEffect(() => {
    if (globalState) {
      isExternalPlayer(globalState)
    }
  }, [globalState])

  useEffect(() => {
    let parsed = queryString.parse(window.location.search)
    const token = parsed.access_token
    if (token) {
      setAuthToken(token)
      localStorage.setItem("spotifyAuthToken", token)
    } else if (getToken()) {
      setAuthToken(getToken())
    }
  }, [])

  useLayoutEffect(() => {
    if (authToken) {
      initializePlayer(authToken)
    }
    return () => (
      player ? player.disconnect() : "",
      clearInterval(playerSyncInterval),
      clearInterval(playerProgressInterval)
      // clearInterval(syncTimeout)
    )
  }, [authToken])

  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }
  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window

    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }
  const playFn = async (
    validateToken,
    id,
    uri,
    artistUris,
    contextUri,
    offset = 0
  ) => {
    const parsedValues = {
      artistSongs: artistUris && artistUris.map((x) => x.uri),
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
    if (getToken()) {
      syncTimeout = setInterval(() => {
        syncDevice(getToken())
      }, 1000)
      return () => clearInterval(syncTimeout)
    }
  }, [getToken(), globalState])

  return (
    <PlayerContext.Provider
      value={{
        setDeviceVolume,
        globalState,
        playFn,
        pauseFn,
      }}
    >
      <>{props.children}</>
    </PlayerContext.Provider>
  )
}
