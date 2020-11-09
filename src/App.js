import logo from "./logo.svg"
import "./App.scss"
import React, { useRef, useState, useEffect } from "react"
import { SpotifyAuth, Scopes } from "react-spotify-auth"
import Cookies from "js-cookie"

import AlbumContainer from "./AlbumContainer"
import PlaylistContainer from "./PlaylistContainer"
import ArtistContainer from "./ArtistContainer"
import CategoriesContainer from "./CategoriesContainer"
import TopTracksContainer from "./TopTracksContainer"
import RecentPlayedContainer from "./RecentPlayedContainer"
import AdvertismentContainer from "./AdvertismentContainer"
import ChartsContainer from "./ChartsContainer"
import Player from "./Player"

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
} from "@fortawesome/free-solid-svg-icons"

import playIcon from "./images/play.svg"
import volumeIcon from "./images/volume.svg"

const axios = require("axios")

function App() {
  const clientId = "9e214f26fedf458082c801c1eb63f09c"
  const redirectUri = "http://localhost:3000"
  const scopes = [
    "user-read-recently-played",
    "user-library-read",
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
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
  const [leftScrollStatus, setLeftScrollStatus] = useState(false)
  const [rightScrollStatus, setRightScrollStatus] = useState(false)
  const [chartPlayListData, setChartPlayListData] = useState([])
  const [chartAlbumData, setChartAlbumData] = useState([])
  const [chartArtistData, setChartArtistData] = useState([])
  const [categoriesData, setCategoriesData] = useState([])
  const [newReleaseData, setNewReleaseData] = useState([])
  const [featuredPlaylistsData, setFeaturedPlaylistsData] = useState([])
  const [authToken, setAuthToken] = useState("")
  const [userprofile, setUserProfile] = useState({})
  const [sidePlayListData, setSidePlayListData] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userTopTracksListData, setUserTopTracksListData] = useState([])
  const [userCurrentPlayingTrack, setUserCurrentPlayingTrack] = useState({})
  const [userPlayedTracksListData, setUserPlayedTracksListData] = useState([])
  const [userRecommendListData, setUserRecommendListData] = useState([])
  const [currentPlayingState, setCurrentPlayingState] = useState({})
  const [top50TracksList, setTop50TracksList] = useState([])
  const [viral50TracksList, setViral50TracksList] = useState([])

  const ref = useRef(null)

  const handleNav = (direction) => {
    if (direction === "left" && ref) {
      ref.current.scrollLeft -= 200
    } else {
      ref.current.scrollLeft += 200
    }
  }

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
  }

  const getPlayingHistory = (validateToken) => {
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=20&after=1404811043508`
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
        console.log(response, "history")
        setUserPlayedTracksListData(response.data.items)
        let cleanArray = response.data.items.filter(
          (ele, ind) =>
            ind ===
            response.data.items.findIndex(
              (elem) => elem.track.id === ele.track.id
            )
        )
        setUserPlayedTracksListData(cleanArray)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getCurrentPlaying = (validateToken) => {
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
        setUserCurrentPlayingTrack(response.data.item)
        setCurrentPlayingState(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
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

  const getCategories = (validateToken) => {
    const url = `https://api.spotify.com/v1/browse/categories`
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
        setCategoriesData(response.data.categories.items)
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

  const getUserAllPlayLists = (validateToken) => {
    const url = `https://api.spotify.com/v1/me/playlists?offset=0&limit=20`
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
        console.log(response, "profile")
        setSidePlayListData(response.data.items)
        // setUserProfile(response.data)
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

  const getUserTracksTopList = (validateToken) => {
    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=10&offset=5`
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
        setUserTopTracksListData(response.data.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getTop50TracksList = (validateToken) => {
    const url = `https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks`
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
        let cleanTop50TracksLisArray = response.data.items.filter(
          (ele, ind) =>
            ind ===
            response.data.items.findIndex(
              (elem) => elem.track.id === ele.track.id
            )
        )
        setTop50TracksList(cleanTop50TracksLisArray)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getViral50TracksList = (validateToken) => {
    const url = `https://api.spotify.com/v1/playlists/37i9dQZEVXbLiRSasKsNU9/tracks`
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
        console.log(response.data, "viral50")
        let cleanViral50TracksLisArray = response.data.items.filter(
          (ele, ind) =>
            ind ===
            response.data.items.findIndex(
              (elem) => elem.track.id === ele.track.id
            )
        )
        setViral50TracksList(cleanViral50TracksLisArray)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getRecommendList = (validateToken) => {
    const url = `https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_tracks=0c6xIDDpzE81m2q797ordA&min_energy=0.4&min_popularity=50&market=US`
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
        console.log(response.data.tracks, "shit")
        setUserRecommendListData(response.data.tracks)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    const token = window.location.hash.substr(1).split("&")[0].split("=")[1]
    if (token) {
      setAuthToken(token)
    }
  }, [])

  useEffect(() => {
    if (authToken) {
      // omg()
      getViral50TracksList(authToken)
      getTop50TracksList(authToken)
      getRecommendList(authToken)
      getPlayingHistory(authToken)
      getCurrentPlaying(authToken)
      getUserTracksTopList(authToken)
      getUserArtistsTopList(authToken)
      getUserAllPlayLists(authToken)
      getUserCurrentProfile(authToken)
      getUserCurrentPlaylists(authToken)
      getCategories(authToken)
      getNewReleases(authToken)
      getFeaturedPlaylists(authToken)
    }
  }, [authToken])

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     getCurrentPlaying(authToken)
  //   }, 1500)

  //   return () => clearInterval(intervalId)
  // }, [authToken])

  const omg = () => {
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
      const sdk = new Player({
        name: "Rex web player",
        volume: 1.0,
        getOAuthToken: (callback) => {
          console.log(authToken)
          callback(authToken)
        },
      })
      console.log("Paused!")
      sdk.seek(60 * 1000).then(() => {
        console.log("Changed position!")
      })
      sdk.getVolume().then((volume) => {
        let volume_percentage = volume * 100
        console.log(`The volume of the player is ${volume_percentage}%`)
      })
      sdk.on("player_state_changed", (state) => {
        if (!state) {
          console.error(
            "User is not playing music through the Web Playback SDK"
          )
          return
        }
        let {
          current_track,
          next_tracks: [next_track],
        } = state.track_window

        console.log("Currently Playing", current_track)
        setUserCurrentPlayingTrack(current_track)
        console.log("Playing Next", next_track)
      })
      let connected = await sdk.connect()
      if (connected) {
        let state = await waitUntilUserHasSelectedPlayer(sdk)
        await sdk.resume()
        await sdk.setVolume(0.5)
        let {
          id,
          uri: track_uri,
          name: track_name,
          duration_ms,
          artists,
          album: { name: album_name, uri: album_uri, images: album_images },
        } = state.track_window.current_track
        console.log(`You're listening to ${track_name} by ${artists[0].name}!`)
        console.log(duration_ms, "duration_ms")
      }
    })()
  }

  const progressBarStyles = {
    width:
      (currentPlayingState && currentPlayingState.progress_ms * 100) /
        userCurrentPlayingTrack.duration_ms +
      "%",
  }

  return (
    <>
      <div ng-app="app" ng-cloak>
        <div
          id="bg-artwork"
          style={{
            backgroundImage: `url(${
              userCurrentPlayingTrack &&
              userCurrentPlayingTrack.album &&
              userCurrentPlayingTrack.album.images[0].url
            })`,
          }}
        ></div>
        <div id="bg-layer"></div>
        <div class="header bg-dark pfx layer2 b0 bbottom  bcdefault left-right top p2">
          <div class="dib">
            <button
              class="button is-rounded is-small is-dark"
              onClick={handlelogin}
            >
              Login
            </button>
            <input
              class="rounded--medium outline0 b0 p1 pl2 is-rounded is-small is-dark"
              placeholder="Search..."
              type="search"
            />
          </div>
          <div class="pull-right dib mt1 mr2">
            <div class="ohidden dib va-middle">
              <img
                src={userprofile.images && userprofile.images[0].url}
                class="avatar-small circle"
              />
            </div>
            <p class="text-default fs dib m0 p0 ml1">
              {userprofile.display_name}
            </p>
          </div>
        </div>

        <div class="columns is-variable is-8" style={{ zIndex: 99 }}>
          <div class="column is-2 is-hidden-mobile">
            <div
              class="wi-220px bg-dark m0 pfx top-bottom t-45 oscroll pb4"
              style={{ marginBottom: 310 }}
              ng-controller="menuCtrl as menu"
            >
              <ul class="bg-dark list m0 mt2 p0 pl2 lineheight2">
                <li ng-repeat="item in mainMenuItems" class="va-middle">
                  <span
                    class="ml3 text-default fs dib truncate wi-150px va-middle"
                    style={{ color: "white" }}
                  >
                    Playlists
                  </span>
                  {sidePlayListData.map((item, index) => {
                    return (
                      <span class="ml3 text-default fs dib truncate wi-150px va-middle">
                        {item.name}
                      </span>
                    )
                  })}
                </li>
              </ul>
              <div
                class="div"
                style={{
                  height: 150,
                  zIndex: 99,
                }}
              ></div>

              <div class="player pfx left-right bottom">
                <div class="player__currentTrack is-hidden-mobile wi-220px">
                  <div class="track wi-220px p1 b0 btop bsolid bcdefault dib m0 p0 bg-gray">
                    <p
                      class="text-white m0 p2 mb1 fs"
                      style={{ margin: "auto" }}
                    >
                      + New Playlist
                    </p>
                  </div>
                </div>
                <div
                  class="player__currentTrack is-hidden-mobile wi-220px"
                  style={{ marginBottom: 95 }}
                >
                  <div class="album wi-220px b0 btop bsolid bcdefault">
                    <img
                      src={
                        userCurrentPlayingTrack &&
                        userCurrentPlayingTrack.album &&
                        userCurrentPlayingTrack.album.images[0].url
                      }
                      class="wi-220px m0 dib p0 di"
                    />
                  </div>
                  <div class="track wi-220px p1 b0 btop bsolid bcdefault dib m0 p0 bg-gray">
                    <p class="text-white m0 p0 mb1 fs">
                      {userCurrentPlayingTrack && userCurrentPlayingTrack.name}
                    </p>
                    <p class="text-ivory m0 p0 fss">
                      {userCurrentPlayingTrack &&
                        userCurrentPlayingTrack.artists &&
                        userCurrentPlayingTrack.artists[0].name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-12-mobile is-10-tablet" style={{ zIndex: 99 }}>
            <section class="section mt4">
              <div class="hs__wrapper">
                {/* <Player
                  currentPlayingState={currentPlayingState}
                  userCurrentPlayingTrack={userCurrentPlayingTrack}
                /> */}

                <AdvertismentContainer
                  userRecommendListData={userRecommendListData}
                />
                <ChartsContainer
                  viral50TracksList={viral50TracksList}
                  top50TracksList={top50TracksList}
                />

                <RecentPlayedContainer
                  userPlayedTracksListData={userPlayedTracksListData}
                />
                <TopTracksContainer
                  userTopTracksListData={userTopTracksListData}
                />
                <AlbumContainer newReleaseData={newReleaseData} />
                <ArtistContainer
                  userTopArtistListData={userTopArtistListData}
                />
                <PlaylistContainer
                  featuredPlaylistsData={featuredPlaylistsData}
                />
                <CategoriesContainer categoriesData={categoriesData} />
              </div>
            </section>
          </div>
        </div>

        <div
          class="player__controls bg-gray b0 btop bsolid bcdefault p6 "
          style={{
            position: "fixed",
            bottom: 0,
            zIndex: 101,
          }}
        >
          <div class="dt tl-fixed wi-100">
            <div class="dtc tl-fixed pl1 wi-210px">
              <div class="dtc wi-50">
                <span class="icon icon--small" style={{ color: "grey" }}>
                  <FontAwesomeIcon icon={faBackward} />
                </span>
                <div class=" dib  bwidth p1 play ml2  mr2">
                  <span class="icon icon--small">
                    {/* <FontAwesomeIcon icon={faPlayCircle} /> */}
                    <FontAwesomeIcon icon={faPause} />
                  </span>
                </div>
                <span class="icon icon--small" style={{ color: "grey" }}>
                  <FontAwesomeIcon icon={faForward} />
                </span>
              </div>
              <div class="dtc wi-50">
                <input
                  type="range"
                  name="points"
                  min="1"
                  max="100"
                  value="100"
                  class="va-middle mr1 ml1 wi-100 rangeSlider"
                />
              </div>
            </div>
            <div class="dtc pl2">
              <div class="dt tl-fixed">
                <div class="dtc">
                  <img class="icon icon--small" src={volumeIcon} alt="" />
                  {/* <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-gray"><use xlink:href="#volume"></use></svg> */}
                </div>
                <div class="dtc">
                  <p class="m0 p0 pl1 ml2 mr2 ml2 text-white dib fss">
                    {millisToMinutesAndSeconds(
                      currentPlayingState && currentPlayingState.progress_ms
                    )}
                  </p>
                  {/* <p class="m0 p0 mr1 ml2 text-white dib fss">{{ 0 | date : 'm:ss' }}</p> */}
                </div>
                <div class="dtc wi-100">
                  <div className="progress">
                    <div className="progress__bar" style={progressBarStyles} />
                  </div>
                  {/* <input
                      type="range"
                      name="points"
                      min="1"
                      max="100"
                      class="rangeSlider va-middle mr1 ml1  dtc wi-100"
                      value={
                        (currentPlayingState.progress_ms * 100) /
                        userCurrentPlayingTrack.duration_ms
                      }
                    /> */}
                </div>
                <div class="dtc">
                  <p class="m0 p0 pl1 ml2 mr2 ml2 text-white dib fss">
                    {millisToMinutesAndSeconds(
                      userCurrentPlayingTrack &&
                        userCurrentPlayingTrack.duration_ms
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div class="dtc tl-fixed tar pr1 wi-50px">
              {/* <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-white va-middle"><use xlink:href="#shuffle"></use></svg>
          <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-green ml1 va-middle"><use xlink:href="#repeat"></use></svg> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
