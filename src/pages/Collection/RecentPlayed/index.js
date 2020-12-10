import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import axios from "axios"

import ColorThief from "colorthief"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisH, faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import { millisToMinutesAndSeconds } from "../../../utils/utils"
import { AuthContext } from "../../../context/auth"
import { PlayerContext } from "../../../context/player"
import { PlaylistContext } from "../../../context/playlist"

import { SoundEqualizer } from "../../../components/SoundEqualizer"
import { useHistory } from "react-router-dom"

export default (props) => {
  const history = useHistory()
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const { userPlayedTracksListData } = useContext(PlaylistContext)
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [recentPlayed, setRecentPlayed] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")
  const [current, setCurrent] = useState("")
  const [afterRowsID, setBeforeRowsID] = useState("")

  const handleNext = (value) => {
    setCurrent(value)
  }

  useEffect(() => {
    setTrimHeader(false)
    getRecentPlayed(getToken(), current)
  }, [current, getToken(), props.match.params.id])

  const getRecentPlayed = (validateToken, currentValue) => {
    const afterCondition = currentValue == "" ? `` : `&before=${currentValue}`
    let prevRecentPlayedArray = []
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=20${afterCondition}`
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
        let cleanArtistAlbumsArray = response.data.items.filter(
          (ele, ind) =>
            ind ===
            response.data.items.findIndex(
              (elem) => elem.track.name === ele.track.name
            )
        )
        prevRecentPlayedArray.push(...recentPlayed, ...cleanArtistAlbumsArray)
        setBeforeRowsID(response.data.cursors && response.data.cursors.before)
        setRecentPlayed(prevRecentPlayedArray)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const buildItems = () => {
    return (
      recentPlayed &&
      recentPlayed.map((item, index) => {
        return (
          <div class="column is-3 album__item" key={index}>
            <div
              class="album__item__image__wrapper"
              onClick={() => {
                history.push(`/album/${item.track.album.id}`)
              }}
            >
              <img
                class="album__item__image"
                src={item && item.track.album.images[1].url}
                alt=""
              />
              <div class="album__item__play__button">
                <a
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.stopPropagation()
                    playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      "",
                      "",
                      item.track.album.uri
                    )
                  }}
                >
                  {globalState &&
                  globalState.track &&
                  globalState.track.album &&
                  globalState.track.album.uri.includes(
                    item && item.track.album.uri
                  ) ? (
                    <button class="button">
                      <FontAwesomeIcon icon={faPause} />
                    </button>
                  ) : (
                    <button class="button">
                      <FontAwesomeIcon icon={faPlay} />
                    </button>
                  )}
                </a>
              </div>
            </div>
            <div class="album__item__description">
              <span class="album__item__title has-text-black">
                {item && item.track.album.name}
              </span>
              <span class="album__item__subtitle">
                {item && item.track.album.artists[0].name}
              </span>
            </div>
          </div>
        )
      })
    )
  }

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient(to left top,#f3f2f7, #cbcad7, #a2a4b8, #78819a, #4e5f7d)`,
            height: 230,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title has-text-white">
                  Recent played
                </strong>
              </li>
            </ul>
          </div>
          <div class="summary__button"></div>
        </div>
      </div>
      <div
        class="main__wrap summary on"
        style={{
          display: trimHeader ? "block" : "none",
          borderBottom: `1px solid #eee`,
        }}
      >
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  Recent played
                </strong>
              </li>
            </ul>
          </div>
          <div class="summary__button">
            <ul class="button" style={{ border: 0, background: "transparent" }}>
              <li class="button__list button__play-btn has-text-black has-text-centered has-text-weight-bold is-small">
                <p class="button__text">PLAY</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="main__wrap">
        <div class="columns is-multiline">
          {buildItems()}
          {afterRowsID ? (
            <p class="mt-2 mb-2 has-text-centered" style={{ width: `${100}%` }}>
              <button
                class="button is-light is-outlined has-text-grey"
                onClick={() => {
                  handleNext(afterRowsID)
                }}
              >
                Load More
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
