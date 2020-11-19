import "./App.scss"
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom"
import Cookies from "js-cookie"

import { useSpring, a, config } from "react-spring"
import { useDrag } from "react-use-gesture"

import { millisToMinutesAndSeconds } from "./utils/utils"
import { previousFn, nextFn } from "./apis/playerControl"
import memoize from "memoize-one"

import Player from "./Player"
import { PlayerControl } from "./components/PlayerControl"
import { SideMenu } from "./components/SideMenu"

import { PlaylistProvider } from "./context/playlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCoffee,
  faFastForward,
  faFastBackward,
  faBackward,
  faPlay,
  faPause,
  faPlayCircle,
  faForward,
  faPauseCircle,
  faStepBackward,
  faStepForward,
  faChevronDown,
  faEllipsisH,
  faHome,
  faSync,
  faRandom,
  faVolumeUp,
  faList,
  faMobile,
  faExpand,
  faExpandAlt,
  faSearch,
  faTimesCircle,
  faBan,
  faHeart,
} from "@fortawesome/free-solid-svg-icons"

import playIcon from "./images/play.svg"
import volumeIcon from "./images/volume.svg"
import homeIcon from "./images/home.svg"
import listIcon from "./images/list.svg"
import searchIcon from "./images/search.svg"

import axios from "axios"

import ColorThief from "colorthief"

import Home from "./pages/Home"
import PlaylistDetail from "./pages/PlaylistDetail"
import ArtistDetail from "./pages/ArtistDetail"
import AlbumDetail from "./pages/AlbumDetail"

function App() {
  const { deviceWidth, deviceHeight } = useWindowDimensions()
  const imgRef = useRef(null)
  const height = 380
  var playerSyncInterval = 5
  var playerProgressInterval = 5
  var seekUpdateInterval = 100
  const clientId = "9e214f26fedf458082c801c1eb63f09c"
  const redirectUri = window.location.origin
  const scopes = [
    "user-read-recently-played",
    "user-library-read",
    "user-top-read",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-follow-modify",
    "user-follow-read",
    "user-read-private",
    "user-read-email",
    "ugc-image-upload",
    "playlist-modify-private",
    "playlist-read-collaborative",
    "playlist-read-private",
    "playlist-modify-public",
    "streaming",
    "app-remote-control",
  ]

  var syncTimeout
  var intervalId2
  var intervalId

  const location = useLocation()

  // const [playerSyncInterval, setPlayerSyncInterval] = useState(5)
  const [playerBackground, setPlayBackground] = useState("")
  const [leftScrollStatus, setLeftScrollStatus] = useState(false)
  const [rightScrollStatus, setRightScrollStatus] = useState(false)
  const [chartPlayListData, setChartPlayListData] = useState([])
  const [chartAlbumData, setChartAlbumData] = useState([])
  const [chartArtistData, setChartArtistData] = useState([])
  const [newReleaseData, setNewReleaseData] = useState([])
  const [featuredPlaylistsData, setFeaturedPlaylistsData] = useState([])
  const [authToken, setAuthToken] = useState("")
  const [userprofile, setUserProfile] = useState({})
  const [sidePlayListData, setSidePlayListData] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userCurrentPlayingTrack, setUserCurrentPlayingTrack] = useState({})
  const [userRecommendListData, setUserRecommendListData] = useState([])
  const [currentPlayingState, setCurrentPlayingState] = useState({})
  const [gradientNum, setGradientNum] = useState(null)
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
  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window

    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }
  const ref = useRef(null)
  const scrollContainer = useRef(null)
  const [trimHeader, setTrimHeader] = useState(false)

  const handleScroll = () => {
    if (
      window &&
      scrollContainer &&
      scrollContainer.current &&
      scrollContainer.current.scrollTop
    ) {
      const init = 306
      const nowTop =
        init -
        (scrollContainer &&
          scrollContainer.current &&
          scrollContainer.current.scrollTop * 1.2)
      setGradientNum(nowTop)

      if (nowTop < 35 && nowTop !== null) {
        setTrimHeader(true)
        setGradientNum(null)
      } else {
        setTrimHeader(false)
        setGradientNum(null)
      }
    } else {
      setGradientNum(null)
      // this.documentStyle.setProperty(
      //   "--navbar-background-color",
      //   this.scrolledNavbarBackgroundColor
      // )
    }
  }

  useLayoutEffect(() => {
    window.addEventListener("scroll", handleScroll, true)
    return () => (
      window.removeEventListener("scroll", handleScroll), setGradientNum(null)
    )
  }, [scrollContainer])

  let player = null

  function validateURI(input) {
    const validTypes = ["album", "artist", "playlist", "show", "track"]

    /* istanbul ignore else */
    if (input && input.indexOf(":") > -1) {
      const [key, type, id] = input.split(":")

      /* istanbul ignore else */
      if (
        key === "spotify" &&
        validTypes.indexOf(type) >= 0 &&
        id.length === 22
      ) {
        return true
      }
    }

    return false
  }

  function getSpotifyURIType(uri) {
    const [, type = ""] = uri.split(":")
    return type
  }

  const getPlayOptions = memoize((data) => {
    const playOptions = {
      context_uri: undefined,
      uris: undefined,
    }
    if (data) {
      const ids = Array.isArray(data) ? data : [data]

      if (!ids.every((d) => validateURI(d))) {
        // eslint-disable-next-line no-console
        console.error("Invalid URI")

        return playOptions
      }

      if (ids.some((d) => getSpotifyURIType(d) === "track")) {
        if (!ids.every((d) => getSpotifyURIType(d) === "track")) {
          // eslint-disable-next-line no-console
          console.warn("You can't mix tracks URIs with other types")
        }

        playOptions.uris = ids.filter(
          (d) => validateURI(d) && getSpotifyURIType(d) === "track"
        )
      } else {
        if (ids.length > 1) {
          // eslint-disable-next-line no-console
          console.warn(
            "Albums, Artists, Playlists and Podcasts can't have multiple URIs"
          )
        }

        // eslint-disable-next-line prefer-destructuring
        playOptions.context_uri = ids[0]
      }
    }

    return playOptions
  })

  async function getPlaybackState(token) {
    return fetch(`https://api.spotify.com/v1/me/player`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    }).then((d) => {
      if (d.status === 204) {
        return null
      }

      return d.json()
    })
  }

  let emptyTrack = {
    artists: "",
    durationMs: 0,
    id: "",
    image: "",
    name: "",
    uri: "",
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
          artists: player.item.artists.map((d) => d.name).join(", "),
          durationMs: player.item.duration_ms,
          id: player.item.id,
          image: player.item.album.images[0].url,
          name: player.item.name,
          uri: player.item.uri,
        }
      }

      updateGlobalState({
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

  function usePrevious(value) {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  function isEqualArray(A, B) {
    if (!Array.isArray(A) || !Array.isArray(B) || A.length !== B.length) {
      return false
    }

    let result = true

    A.forEach((a) =>
      B.forEach((b) => {
        result = a === b
      })
    )

    return result
  }

  const handleNav = (direction) => {
    if (direction === "left" && ref) {
      ref.current.scrollLeft -= 200
    } else {
      ref.current.scrollLeft += 200
    }
  }

  const isExternalPlayer = (data) => {
    const { currentDeviceId, deviceId, status } = globalState
    return currentDeviceId && currentDeviceId !== deviceId
  }

  useEffect(() => {
    if (globalState) {
      isExternalPlayer(globalState)
    }
  }, [globalState])

  const playFn = useCallback(
    (validateToken, id, uri, contextUri) => {
      const parsedValues = {
        artistSongs: contextUri && contextUri.map((x) => x.uri),
      }

      let body
      const { position } = globalState
      const { offset } = userCustomState
      const { artistSongs } = parsedValues
      if (contextUri) {
        // const isArtist = contextUri.indexOf("artist") >= 0
        // let position
        // if (!isArtist) {
        //   position = { position: 0 }
        // }
        body = JSON.stringify({ uris: artistSongs, offset: { position: 0 } })
      }
      if (uri) {
        body = JSON.stringify({ uris: [uri], offset: { position: 0 } })
      }

      return fetch(
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
    },
    [globalState, authToken]
  )

  async function getDevices(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/devices`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    }).then((d) => d.json())
  }

  const getNewReleases = (validateToken) => {
    const url = `https://api.spotify.com/v1/browse/new-releases`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setNewReleaseData(response.data.albums.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getFeaturedPlaylists = (validateToken) => {
    const url = `https://api.spotify.com/v1/browse/featured-playlists`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setFeaturedPlaylistsData(response.data.playlists.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getUserCurrentPlaylists = (validateToken) => {
    const url = `https://api.spotify.com/v1/recommendations/available-genre-seeds`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        // console.log(response)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const handlelogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=true`
    window.spotifyCallback = (payload) => {
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${payload}`,
        },
      }).then((response) => {
        return response.json()
      })
    }
  }

  const getUserCurrentProfile = (validateToken) => {
    const url = `https://api.spotify.com/v1/me`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        // console.log(response.data, "profile")
        setUserProfile(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getRecommendList = (validateToken) => {
    const url = `https://api.spotify.com/v1/recommendations?seed_genres=pop&min_energy=0.8&min_popularity=80&market=TW`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setUserRecommendListData(response.data.tracks)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getUserArtistsTopList = (validateToken) => {
    const url = `https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10&offset=5`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setUserTopArtistListData(response.data.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useEffect(() => {
    const token = window.location.hash.substr(1).split("&")[0].split("=")[1]
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
      getRecommendList(authToken)
      getUserArtistsTopList(authToken)
      getUserCurrentProfile(authToken)
      getUserCurrentPlaylists(authToken)
      getNewReleases(authToken)
      getFeaturedPlaylists(authToken)
    }
    return () => (
      player ? player.disconnect() : "",
      clearInterval(playerSyncInterval),
      clearInterval(playerProgressInterval)
      // clearInterval(syncTimeout)
    )
  }, [authToken])

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

    if (!savedDeviceId || !devices.find((d) => d.id === savedDeviceId)) {
      sessionStorage.setItem("rswpDeviceId", currentDeviceId)
    } else {
      currentDeviceId = savedDeviceId
    }

    return { currentDeviceId, devices }
  }

  const setAlbumImage = (album) => {
    const width = Math.min(...album.images.map((d) => d.width))
    const thumb = album.images.find((d) => d.width === width) || {}
    return thumb.url
  }

  const handlePlayerStateChanges = async (state) => {
    try {
      /* istanbul ignore else */
      if (state) {
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

  const progressBarStyles = {
    width:
      globalState && globalState.track
        ? (globalState.progressMs * 100) / globalState.track.durationMs + "%"
        : null,
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
    /* istanbul ignore else */
    if (isExternalPlayer) {
      await setVolume(authToken, Math.round(volume * 100), deviceId)
      // await syncDevice()
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
        alert("shit")
      }
      if ((!shouldSync || !isExternalPlayer) && playerSyncInterval) {
        alert("shit")
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
  const prevState = usePrevious(globalState)
  const prevCustomState = usePrevious(userCustomState)

  const [{ y }, set] = useSpring(() => ({ y: height }))

  const open = ({ canceled }) => {
    // when cancel is true, it means that the user passed the upwards threshold
    // so we change the spring config to create a nice wobbly effect
    set({
      y: 0,
      immediate: false,
      config: canceled ? config.wobbly : config.stiff,
    })
  }
  const close = (velocity = 0) => {
    set({ y: height, immediate: false, config: { ...config.stiff, velocity } })
  }

  const bind = useDrag(
    ({ last, vxvy: [, vy], movement: [, my], cancel, canceled }) => {
      // if the user drags up passed a threshold, then we cancel
      // the drag so that the sheet resets to its open position
      if (my < -70) cancel()

      // when the user releases the sheet, we check whether it passed
      // the threshold for it to close, or if we reset it to its open positino
      if (last) {
        my > height * 0.5 || vy > 0.5 ? close(vy) : open({ canceled })
      }
      // when the user keeps dragging, we just move the sheet according to
      // the cursor position
      else set({ y: my, immediate: true })
    },
    {
      initial: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    }
  )

  const display = y.to((py) => (py < height ? "block" : "none"))

  const bgStyle = {
    transform: y.to(
      [0, height],
      ["translateY(-8%) scale(1.16)", "translateY(0px) scale(1.05)"]
    ),
    opacity: y.to([0, height], [0.4, 1], "clamp"),
  }

  useEffect(() => {
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    if (globalState && globalState.track && globalState.track.image) {
      const colorThief = new ColorThief()
      const img = imgRef.current
      img.onload = () => {
        // image  has been loaded
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        console.log(rgbToHex(result[0], result[1], result[2]))
        setPlayBackground(rgbToHex(result[0], result[1], result[2]))
      }
      const rgbToHex = (r, g, b) =>
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16)
            return hex.length === 1 ? "0" + hex : hex
          })
          .join("")
    }
  }, [globalState])

  useLayoutEffect(() => {
    syncTimeout = setInterval(() => {
      syncDevice(authToken)
    }, 1000)
    return () => clearInterval(syncTimeout)
  }, [authToken])

  return (
    <>
      <div ng-app="app" ng-cloak>
        <PlaylistProvider>
          <div class="wrap">
            <div class="list-area">
              <SideMenu />
              <div class="main" ref={scrollContainer}>
                <div
                  class="main__wrap top-scroll-bg"
                  style={{
                    display: trimHeader ? "block" : "none",
                    background: trimHeader ? "white" : "white",
                    zIndex: 3,
                  }}
                  // style={{
                  //   background: `linear-gradient(to bottom,  rgba(0,0,0,0) 0%, rgb(255, 255, 255) ${gradientNum}%)`,
                  // }}
                ></div>
                <div
                  class="main__wrap summary on ml-0"
                  style={{
                    display: trimHeader ? "block" : "none",
                    borderBottom: `1px solid #eee`,
                  }}
                >
                  <div class="summary__box ml-0">
                    {/* <p class="title is-5"> Home</p> */}
                    <div class="summary__text ml-0">
                      <ul>
                        <li>
                          <strong class="summary__text--title title is-4">
                            {location.pathname === "/" ? "Home" : null}
                          </strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* omg */}

                <div class="main__wrap top-bar">
                  <ul class="top-bar__left top-bar__wrap">
                    {/* <li>
                      <i class="top-bar__icon fas fa-chevron-left"></i>
                    </li>
                    <li>
                      <i class="top-bar__icon fas fa-chevron-right"></i>
                    </li> */}
                    <li class="top-bar__search">
                      {/* <i class="top-bar__search--icon top-bar__icon fas fa-search has-text-grey-light">
                        <FontAwesomeIcon icon={faSearch} />
                      </i> */}
                      <input
                        type="text"
                        class="input is-small is-rounded is-light"
                        placeholder="Search"
                      />
                    </li>
                  </ul>
                  <ul class="top-bar__right top-bar__wrap">
                    {/* <li>
                      <i class="top-bar__icon top-bar__right--user-icon far fa-user-circle"></i>
                    </li> */}
                    <li>
                      {/* <img
                        src={userprofile.images && userprofile.images[0].url}
                        class="avatar-small circle"
                      />
                      {userprofile.display_name} */}

                      <button
                        class="button is-rounded is-small is-light"
                        onClick={handlelogin}
                      >
                        LOGIN
                      </button>
                    </li>
                    <li>
                      <i class="fas fa-chevron-down"></i>
                    </li>
                  </ul>
                </div>

                <section class="section">
                  <div class="hs__wrapper">
                    {/* <AdvertismentContainer
                      userRecommendListData={userRecommendListData}
                    /> */}
                    {/* <CategoriesContainer /> */}

                    <Switch>
                      <Route
                        exact
                        path="/"
                        render={(props) => (
                          <Home
                            {...props}
                            userRecommendListData={userRecommendListData}
                            newReleaseData={newReleaseData}
                            featuredPlaylistsData={featuredPlaylistsData}
                            component={Home}
                            globalState={globalState}
                            playFn={playFn}
                            authToken={authToken}
                            userTopArtistListData={userTopArtistListData}
                          />
                        )}
                      />
                      <Route
                        path="/playlist/:id"
                        render={(props) => (
                          <PlaylistDetail
                            {...props}
                            authToken={authToken}
                            trimHeader={trimHeader}
                            setTrimHeader={setTrimHeader}
                          />
                        )}
                      />
                      <Route
                        path="/artist/:id"
                        render={(props) => (
                          <ArtistDetail
                            {...props}
                            setTrimHeader={setTrimHeader}
                            authToken={authToken}
                            trimHeader={trimHeader}
                          />
                        )}
                      />
                      <Route
                        path="/album/:id"
                        render={(props) => (
                          <AlbumDetail
                            {...props}
                            setTrimHeader={setTrimHeader}
                            authToken={authToken}
                            trimHeader={trimHeader}
                          />
                        )}
                      />
                    </Switch>
                  </div>
                </section>
              </div>
            </div>
            <PlayerControl
              imgRef={imgRef}
              playerBackground={playerBackground}
              setDeviceVolume={setDeviceVolume}
              globalState={globalState}
              currentPlayingState={currentPlayingState}
              userCurrentPlayingTrack={userCurrentPlayingTrack}
              progressBarStyles={progressBarStyles}
              playFn={playFn}
              authToken={authToken}
              onChangeRange={handleChangeRange}
            />
          </div>

          {/* <div
            id="bg-artwork"
            style={{
              backgroundImage: `url(${
                globalState && globalState.track && globalState.track.image
              })`,
            }}
          ></div>
          <div id="bg-layer"></div> */}
        </PlaylistProvider>
      </div>
    </>
  )
}

export default App

function getWindowDimensions() {
  const { innerWidth: deviceWidth, innerHeight: deviceHeight } = window
  return {
    deviceWidth,
    deviceHeight,
  }
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowDimensions
}

// useLayoutEffect(() => {
//   const {
//     currentDeviceId,
//     deviceId,
//     error,
//     isInitializing,
//     isPlaying,
//     status,
//     track,
//   } = globalState
//   const { autoPlay, offset, syncExternalDevice, uris } = userCustomState
//   const isReady = prevState && prevState.status !== true && status === true
//   const changedURIs = Array.isArray(uris)
//     ? !isEqualArray(prevCustomState && prevCustomState.uris, uris)
//     : prevCustomState && prevCustomState.uris !== uris
//   const playOptions = getPlayOptions(uris)
//   const canPlay =
//     !!currentDeviceId && !!(playOptions.context_uri || playOptions.uris)
//   const shouldPlay = (changedURIs && isPlaying) || !!(isReady && autoPlay)
//   if (canPlay && shouldPlay) {
//     if (isExternalPlayer) {
//       syncTimeout = setInterval(() => {
//         syncDevice(authToken)
//       }, 1000)
//     }
//   }
//   if (
//     prevState &&
//     prevState.currentDeviceId !== currentDeviceId &&
//     currentDeviceId
//   ) {
//     // toggleSyncInterval(isExternalPlayer)
//     // updateSeekBar()
//   }
//   if (prevState && prevState.isPlaying !== isPlaying) {
//     // toggleProgressBar()
//     // toggleSyncInterval(isExternalPlayer)
//   }
// }, [prevState, globalState])
