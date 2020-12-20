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
import RangeSlider from "@gilbarbara/react-range-slider"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisH, faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import { millisToMinutesAndSeconds } from "../../utils/utils"
import { AuthContext } from "../../context/auth"
import { PlayerContext } from "../../context/player"

import { PodcastEqualizer } from "../../components/PodcastEqualizer"
import { SoundEqualizer } from "../../components/SoundEqualizer"

export default (props) => {
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn, progressBar } = useContext(
    PlayerContext
  )
  const { position } = progressBar
  const [showInfo, setShowInfo] = useState({})
  const [playlistImages, setPlaylistImages] = useState([])
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [showEpisodes, setShowEpisodes] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")

  const millisToMinutesAndSeconds2 = (millis) => {
    var minutes = Math.floor((millis / (1000 * 60)) % 60)
    var seconds = Math.floor((millis % 60000) / 1000).toFixed(0)
    var hours = Math.floor((millis / (1000 * 60 * 60)) % 24)

    var hours2 = hours < 10 ? "" + hours : hours
    var minutes2 = minutes < 10 ? "" + minutes : minutes
    var seconds2 = seconds < 10 ? "" + seconds : seconds

    return (
      (hours2 > 1 ? hours2 + " hr " : "") +
      (minutes2 > 1 ? minutes2 + " min " : "") +
      (seconds2 > 1 && minutes2 < 3 ? seconds2 + " sec" : "")
    )
  }

  const getMergedStyles = {
    altColor: "#ccc",
    bgColor: "#fff",
    color: "#333",
    errorColor: "#a60000",
    height: 40,
    loaderColor: "#ccc",
    loaderSize: 32,
    savedColor: "#1cb954",
    sliderColor: "#3D83FF",
    sliderHandleBorderRadius: "50%",
    sliderHandleColor: "#fff",
    sliderHeight: 0.5,
    sliderTrackBorderRadius: 0,
    sliderTrackColor: "rgba(193, 193, 193, 0.3)",
    trackArtistColor: "#999",
    trackNameColor: "#333",
  }

  const nextStyles = {
    ...getMergedStyles,
    sliderHeight: true
      ? getMergedStyles.sliderHeight + 4
      : getMergedStyles.sliderHeight,
  }

  const handleSize = getMergedStyles.sliderHeight + 6

  const getSingleShowDes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/shows/${id}`
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
        setShowInfo(response.data)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const getSingleShowEpisodes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/shows/${id}/episodes`
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
        setShowEpisodes(response.data.items)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useLayoutEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getSingleShowEpisodes(getToken(), props.match.params.id)
      getSingleShowDes(getToken(), props.match.params.id)
    }
  }, [getToken(), props.match.params.id])

  useEffect(() => {
    if (globalState && globalState.track) {
      const hasMatch = playlistTracks.filter(function (value) {
        return value.track.id == globalState.track.id
      })

      if (hasMatch.length == 1 && globalState.isPlaying) {
        setPlayingPlaylistStatus(true)
      } else {
        setPlayingPlaylistStatus(false)
      }
    }
  }, [globalState])

  useEffect(() => {
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    if (showInfo && showInfo.images) {
      const colorThief = new ColorThief()
      const img = playlistRef.current
      img.onload = () => {
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        setPlaylistBackground(rgbToHex(result[0], result[1], result[2]))
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
  }, [showInfo])

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              rgba(28, 29, 29, 0.4),${playlistBackground}
              )`,
            height: 300,
          }}
        ></div>

        <div
          class="summary__img"
          style={{
            backgroundImage: `url(${
              showInfo && showInfo.images && showInfo.images[0].url
            })`,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <span class="summary__text--white summary__text--for-me">
                  {showInfo && showInfo.type && showInfo.type.toUpperCase()}
                </span>
              </li>
              <li>
                <strong class="summary__text--title has-text-white">
                  {showInfo.name}
                </strong>
              </li>
              <li>
                <p class="line-clamp-text has-text-white">
                  {showInfo.description}
                </p>
              </li>
            </ul>
          </div>
          <div class="buttons mt-2">
            {isPlayingPlaylist &&
            globalState &&
            globalState.isPlaying &&
            globalState.track &&
            globalState.track.showUri == showInfo.uri ? (
              <button
                class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  pauseFn(getToken())
                }}
              >
                <FontAwesomeIcon icon={faPause} />
                <span class="ml-2">Pause</span>
              </button>
            ) : (
              <button
                class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  playFn(
                    getToken(),
                    globalState.currentDeviceId,
                    "",
                    "",
                    showInfo.uri
                  )
                }}
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  class="icon  ml-1 mr-2"
                  style={{ fontSize: 8 }}
                />
                Play
              </button>
            )}
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
        <img
          class="summary__img"
          crossOrigin={"anonymous"}
          ref={playlistRef}
          alt={""}
          src={showInfo && showInfo.images && showInfo.images[0].url}
        />
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  {showInfo.name}
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
      <div class="main__wrap mt-6">
        <p class="title is-5 has-text-black">Episodes</p>

        {showEpisodes &&
          showEpisodes.map((item, index) => {
            return (
              <div class="columns is-multline is-variable is-2">
                <div class="column is-1">
                  <img
                    style={{ borderRadius: 5, width: 150 }}
                    src={item && item.images[0].url}
                    alt=""
                  />
                </div>
                <div class="column is-10 episodes-list__item">
                  <span
                    class="title is-6"
                    style={{
                      color:
                        globalState &&
                        globalState.isPlaying &&
                        globalState.track &&
                        globalState.track.uri == item.uri
                          ? "#3D83FF"
                          : "black",
                    }}
                  >
                    {" "}
                    {item.name}
                  </span>
                  <p class="line-clamp-text mt-2">{item.description}</p>
                  <div class="columns mt-2" style={{ position: "relative" }}>
                    <div class="column is-0 episodes-list__item__play__button">
                      {globalState &&
                      globalState.isPlaying &&
                      globalState.track &&
                      globalState.track.uri == item.uri ? (
                        <PodcastEqualizer />
                      ) : (
                        <button
                          class="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            await playFn(
                              getToken(),
                              globalState.currentDeviceId,
                              item.uri
                            )
                          }}
                        >
                          <FontAwesomeIcon icon={faPlay} />
                        </button>
                      )}
                    </div>
                    <div class="column is-11" style={{ margin: "auto" }}>
                      <div class="columns">
                        <div class="column is-4 has-text-left">
                          <div class="columns">
                            <div class="column is-7">
                              <span class="has-text-grey subtitle is-6">
                                {item.release_date} -
                              </span>
                              <span class="has-text-grey subtitle is-6 ml-2">
                                {globalState &&
                                globalState.isPlaying &&
                                globalState.track &&
                                globalState.track.uri == item.uri ? (
                                  <>
                                    <span>
                                      {millisToMinutesAndSeconds2(
                                        item.duration_ms -
                                          progressBar.progressMs
                                      )}
                                      left
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {millisToMinutesAndSeconds2(
                                      item.duration_ms
                                    )}
                                  </>
                                )}
                              </span>
                            </div>
                            <div class="column is-5" style={{ margin: "auto" }}>
                              {globalState &&
                              globalState.isPlaying &&
                              globalState.track &&
                              globalState.track.uri == item.uri ? (
                                <RangeSlider
                                  class="is-cursor"
                                  axis="x"
                                  styles={{
                                    options: {
                                      handleBorder: 0,
                                      handleColor:
                                        getMergedStyles.sliderHandleColor,
                                      handleSize: 0,
                                      height: 2,
                                      padding: 0,
                                      rangeColor: getMergedStyles.sliderColor,
                                      trackBorderRadius:
                                        getMergedStyles.sliderTrackBorderRadius,
                                      trackColor:
                                        getMergedStyles.sliderTrackColor,
                                    },
                                  }}
                                  x={position}
                                  xMin={0}
                                  xMax={100}
                                  xStep={0.9}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                        {/* <div
                          class="column is-2 has-text-left"
                          style={{ margin: "auto" }}
                        >
                        
                        </div> */}
                        <div class="column is-6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
