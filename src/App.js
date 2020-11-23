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

import { millisToMinutesAndSeconds } from "./utils/utils"
import { useWindowDimensions } from "./utils/customHook"
import { previousFn, nextFn } from "./apis/playerControl"
import memoize from "memoize-one"
import queryString from "query-string"

import Player from "./Player"
import { PlayerControlMobile } from "./components/PlayerControlMobile"
import { PlayerControl } from "./components/PlayerControl"
import { SideMenu } from "./components/SideMenu"
import { Topbar } from "./components/Topbar"

import { AuthProvider } from "./context/auth"
import { PlaylistProvider } from "./context/playlist"
import { PlayerProvider } from "./context/player"

import playIcon from "./images/play.svg"
import volumeIcon from "./images/volume.svg"
import homeIcon from "./images/home.svg"
import listIcon from "./images/list.svg"
import searchIcon from "./images/search.svg"
import logoIcon from "./images/logo.svg"

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
  var syncTimeout
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
  const [cachedAlbumsArray, setCachedAlbumsArray] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userCurrentPlayingTrack, setUserCurrentPlayingTrack] = useState({})
  const [userRecommendListData, setUserRecommendListData] = useState([])
  const [currentPlayingState, setCurrentPlayingState] = useState({})
  const [gradientNum, setGradientNum] = useState(null)
  const ref = useRef(null)
  const scrollContainer = useRef(null)
  const [trimHeader, setTrimHeader] = useState(false)
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

  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window

    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }

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
      setTrimHeader(false)
      setGradientNum(null)
    }
  }

  useLayoutEffect(() => {
    window.addEventListener("scroll", handleScroll, true)
    return () => (
      window.removeEventListener("scroll", handleScroll), setGradientNum(null)
    )
  }, [scrollContainer])

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

  function usePrevious(value) {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
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
    const url = `https://api.spotify.com/v1/recommendations?seed_genres=pop&min_energy=0.2&min_popularity=80&market=TW`
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

  const getUserCurrentPlayingInfo = (validateToken) => {
    const url = `https://api.spotify.com/v1/me/player/currently-playing?market=TW`
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
        console.log(response, "current playing")
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
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

  useLayoutEffect(() => {
    syncTimeout = setInterval(() => {
      syncDevice(authToken)
    }, 1000)
    return () => clearInterval(syncTimeout)
  }, [authToken, globalState])

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
      getUserCurrentPlayingInfo(authToken)
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

  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }

  return (
    <>
      <div>
        <div className="cursor"></div>
        <AuthProvider>
          <PlayerProvider>
            <PlaylistProvider>
              <div className="wrap">
                {!authToken ? (
                  <div className="login__section">
                    <div className="login__section__content">
                      <h1 className="title is-1 has-text-white">
                        <div className="columns is-gapless">
                          <div className="column is-2">
                            <span
                              className="icon is-large"
                              style={{ width: 120 }}
                            >
                              <img src={logoIcon} alt="" />
                            </span>
                          </div>
                          <div
                            className="column is-10"
                            style={{ margin: "auto" }}
                          >
                            Spotify Connect
                            <p className="title is-5 has-text-white mt-2 ml-1">
                              Continue to play and hear half of the music
                              seamlessly.
                            </p>
                            <div className="buttons">
                              <button
                                className="button is-rounded is-outlined has-text-weight-bold"
                                onClick={handlelogin}
                              >
                                LOGIN
                              </button>
                              <button className="button is-black is-rounded has-text-weight-bold">
                                SIGNUP
                              </button>
                            </div>
                          </div>
                        </div>
                      </h1>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="list-area">
                      <SideMenu />
                      <div className="main" ref={scrollContainer}>
                        <div
                          className="main__wrap top-scroll-bg"
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
                          className="main__wrap summary on ml-0"
                          style={{
                            display: trimHeader ? "block" : "none",
                            borderBottom: `1px solid #eee`,
                          }}
                        >
                          <div className="summary__box ml-0">
                            <div className="summary__text ml-0">
                              <ul>
                                <li>
                                  <strong className="summary__text--title title is-4">
                                    {location.pathname === "/" ? "Home" : null}
                                  </strong>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div class="is-hidden-touch">
                          <Topbar userprofile={userprofile} />
                        </div>

                        <section className="section">
                          <div className="hs__wrapper">
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
                                    userRecommendListData={
                                      userRecommendListData
                                    }
                                    newReleaseData={newReleaseData}
                                    featuredPlaylistsData={
                                      featuredPlaylistsData
                                    }
                                    component={Home}
                                    globalState={globalState}
                                    authToken={authToken}
                                    userTopArtistListData={
                                      userTopArtistListData
                                    }
                                  />
                                )}
                              />
                              <Route
                                path="/playlist/:id"
                                render={(props) => (
                                  <PlaylistDetail
                                    {...props}
                                    globalState={globalState}
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
                                    globalState={globalState}
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
                                    globalState={globalState}
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
                      authToken={authToken}
                      onChangeRange={handleChangeRange}
                    />
                    <PlayerControlMobile
                      cachedAlbumsArray={cachedAlbumsArray}
                      deviceHeight={deviceHeight}
                      imgRef={imgRef}
                      playerBackground={playerBackground}
                      setDeviceVolume={setDeviceVolume}
                      globalState={globalState}
                      currentPlayingState={currentPlayingState}
                      userCurrentPlayingTrack={userCurrentPlayingTrack}
                      progressBarStyles={progressBarStyles}
                      authToken={authToken}
                      onChangeRange={handleChangeRange}
                    />
                  </>
                )}
              </div>
            </PlaylistProvider>
          </PlayerProvider>
        </AuthProvider>
      </div>
    </>
  )
}

export default App
