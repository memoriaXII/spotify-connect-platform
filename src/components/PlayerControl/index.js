import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  memo,
} from "react"
import { PlaylistProvider } from "../../context/playlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay,
  faPause,
  faPlayCircle,
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

import debounce from "lodash/debounce"

import ColorThief from "colorthief"
import { millisToMinutesAndSeconds } from "../../utils/utils"

import RangeSlider from "@gilbarbara/react-range-slider"
import { IRangeSliderPosition } from "@gilbarbara/react-range-slider/lib/types"
import { PlayerContext } from "../../context/player"
import { AuthContext } from "../../context/auth"

import { useHistory } from "react-router-dom"

import volumeIcon from "../.././images/volume.svg"
import backwardIcon from "../../images/prev.svg"
import forwardIcon from "../../images/next.svg"
import pauseIcon from "../../images/pause2.svg"
import shuffleIcon from "../../images/shuffle.svg"
import repeatIcon from "../../images/repeat2.svg"
import playIcon from "../../images/play2.svg"
import lyricsIcon from "../../images/microphone.svg"
import { usePrevious } from "../../utils/customHook"
import useFullscreen from "@rooks/use-fullscreen"
import LazyLoad from "react-lazy-load"

export default memo((props) => {
  const {
    isEnabled,
    toggle,
    onChange,
    onError,
    request,
    exit,
    isFullscreen,
    element,
  } = useFullscreen()
  let history = useHistory()
  const {
    testText,
    volumeBar,
    progressBar,
    setIsSeeking,
    syncTimeout,
    updateGlobalState,
    playFn,
    globalState,
    setDeviceVolume,
    handleChangeRange,
  } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  const [playerBackground, setPlayBackground] = useState("")
  const imgRef = useRef(null)
  const [isMagnified, setMagnified] = useState(true)
  const [isfullScreenMode, setFullScreenMode] = useState(false)
  const { volume } = volumeBar
  const { position } = progressBar
  const [utilsState, setUtilsState] = useState({
    isOpen: false,
    volume: volume,
  })

  useEffect(() => {
    if (globalState && globalState.track && globalState.track.image) {
      const colorThief = new ColorThief()
      const img = imgRef.current
      img.onload = () => {
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
    sliderHeight: isMagnified
      ? getMergedStyles.sliderHeight + 4
      : getMergedStyles.sliderHeight,
  }

  const handleSize = getMergedStyles.sliderHeight + 6
  async function previousFn(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/previous`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    })
  }
  async function nextFn(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/next`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    })
  }

  async function pauseFn(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/pause`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
  }

  const handleChangeRangeFn = debounce(({ x }) => {
    handleChangeRange(x)
  }, 100)

  const Wrapper = ({ styles }) => {
    return (
      <div
        style={{
          display: "flex",
          position: "relative",
          transition: "height 0.3s",
          zIndex: 10,
          height: `${styles.sliderHeight}px`,
        }}
      ></div>
    )
  }

  const mouseEnter = () => {
    setMagnified(true)
  }
  const mouseLeave = () => {
    setMagnified(false)
  }
  const handleChangeVolume = ({ x }) => {
    const volume = Math.round(x) / 100
    setDeviceVolume(volume, globalState.currentDeviceId)
  }
  const handleVolumeDragEnd = debounce((position) => {
    const volume = Math.round(position.x) / 100
    setDeviceVolume(volume, globalState.currentDeviceId)
  }, 500)

  const handleTrackDragEnd = debounce((position) => {
    handleChangeRange(position.x)
  }, 500)

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }
  const videoRef = useRef(null)
  const buttonRef = useRef(null)

  function toggleFullScreen2() {
    if (document && !document.fullscreenElement) {
      setFullScreenMode(!isfullScreenMode)
      document.getElementById("fullscreen-div").requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        setFullScreenMode(!isfullScreenMode)
        document.exitFullscreen()
        setFullScreenMode(!isfullScreenMode)
      }
    }
  }

  useEffect(() => {
    if (document) {
      document
        .getElementById("fullscreen-div")
        .addEventListener("fullscreenchange", (event) => {
          if (document.fullscreenElement) {
            console.log(
              `Element: ${document.fullscreenElement.id} entered fullscreen mode.`
            )
            setFullScreenMode(true)
          } else {
            setFullScreenMode(false)
            console.log("Leaving full-screen mode.")
          }
        })
      document.addEventListener("fullscreenerror", (event) => {
        console.error("an error occurred changing into fullscreen")
        console.log(event)
        return
      })

      // document
      //   .getElementById("toggle-fullscreen")
      //   .addEventListener("click", (event) => {
      //     if (document.fullscreenElement) {
      //       // exitFullscreen is only available on the Document object.
      //       document.exitFullscreen()
      //     } else {
      //       document.getElementById("fullscreen-div").requestFullscreen()
      //     }
      //   })
    }
  }, [document])

  return (
    <div
      id="fullscreen-div"
      allow="fullscreen"
      class={isfullScreenMode ? "full-screen-main" : "full-screen-main"}
    >
      <div
        id={isfullScreenMode ? "artwork" : ""}
        style={{
          backgroundImage: `
            url(${
              globalState && globalState.track && globalState.track.image
            })`,
        }}
      ></div>
      <div id={isfullScreenMode ? "layer" : ""}></div>
      {isfullScreenMode ? (
        <section class="fullscreen-player">
          <div class="fullscreen-player__item">
            <Player />
          </div>
        </section>
      ) : null}

      <div
        class="playbar is-hidden-mobile"
        style={
          isfullScreenMode
            ? { position: "absolute", bottom: 0, zIndex: 5, height: 80 }
            : {}
        }
      >
        <div class="album-cover">
          <div class="album-cover__img">
            <LazyLoad debounce={false} offsetVertical={500}>
              <img
                crossOrigin={"anonymous"}
                ref={imgRef}
                alt={""}
                src={
                  globalState && globalState.track && globalState.track.image
                }
                class="wi-220px m0 dib p0 di"
              />
            </LazyLoad>
          </div>
          <div class="album-cover__text-box">
            <div class="album-cover__wrap">
              <p
                class="album-cover__title truncate"
                style={{ fontSize: 12, width: 200 }}
                onClick={() => {
                  history.push(`/album/${globalState.track.album.id}`)
                }}
              >
                {globalState && globalState.track && globalState.track.name}
              </p>
            </div>
            <div class="album-cover">
              <div class="marquee-wrapper" style={{ width: 120 }}>
                {globalState &&
                globalState.track &&
                globalState.track.artistsArray &&
                globalState.track.artistsArray.length !== 1 ? (
                  <marquee behavior="scroll" direction="left" scrollamount="3">
                    {globalState &&
                      globalState.track &&
                      globalState.track.artistsArray &&
                      globalState.track.artistsArray.map((d, index) => {
                        return (
                          <span
                            class={
                              index == 0
                                ? "album-cover__artist"
                                : "album-cover__artist ml-1"
                            }
                            onClick={() => {
                              history.push(`/artist/${d.id}`)
                            }}
                          >
                            {d.name}
                          </span>
                        )
                      })}
                  </marquee>
                ) : (
                  <>
                    {globalState &&
                      globalState.track &&
                      globalState.track.artistsArray &&
                      globalState.track.artistsArray.map((d, index) => {
                        return (
                          <span
                            class={
                              index == 0
                                ? "album-cover__artist"
                                : "album-cover__artist ml-1"
                            }
                            onClick={() => {
                              history.push(`/artist/${d.id}`)
                            }}
                          >
                            {d.name}
                          </span>
                        )
                      })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="play-btns">
          <ul class="play-btns__wrap play-btns__icon-box">
            <li class="play-btns__list">
              <i class="play-btns__icon fas fa-random">
                <img
                  class="icon mt-1"
                  style={{ width: 15, opacity: 0.9 }}
                  src={shuffleIcon}
                  alt=""
                />
              </i>
            </li>
            <li class="play-btns__list">
              <i
                class="play-btns__icon fas fa-step-backward"
                onClick={() => {
                  previousFn(getToken())
                }}
              >
                <img
                  class="icon mt-1"
                  style={{ width: 17, opacity: 0.5 }}
                  src={backwardIcon}
                  alt=""
                />
              </i>
            </li>
            <li>
              {globalState.isPlaying ? (
                <div
                  class="pulse2"
                  onClick={() => {
                    pauseFn(getToken())
                  }}
                >
                  <span class="pulse2__icon">
                    {/* {brodcastIcon()} */}
                    <img class="icon" src={pauseIcon} alt="" />
                  </span>
                </div>
              ) : (
                <div
                  class="pulse2"
                  onClick={() => {
                    playFn(getToken(), globalState.currentDeviceId)
                  }}
                >
                  <span class="pulse2__icon">
                    <img
                      class="icon"
                      style={{ cursor: "pointer" }}
                      src={playIcon}
                      alt=""
                    />
                  </span>
                </div>
              )}
            </li>
            <li class="play-btns__list">
              <i
                class="play-btns__icon fas fa-step-forward"
                onClick={() => {
                  nextFn(getToken())
                }}
              >
                <img
                  class="icon mt-1"
                  style={{ width: 17, opacity: 0.5 }}
                  src={forwardIcon}
                  alt=""
                />
              </i>
            </li>
            <li class="play-btns__list">
              <i class="play-btns__icon fas fa-sync">
                <img
                  class="icon mt-1"
                  style={{ width: 15 }}
                  src={repeatIcon}
                  alt=""
                />
              </i>
            </li>
          </ul>
          <ul class="play-btns__wrap play-btns__range-bar">
            <li>
              <p class="has-text-grey-light">
                {globalState.isPlaying
                  ? millisToMinutesAndSeconds(progressBar.progressMs)
                  : millisToMinutesAndSeconds(progressBar.progressMs)}
              </p>
            </li>
            <li class="play-btns__bar">
              <div
                onMouseEnter={mouseEnter}
                onMouseLeave={mouseLeave}
                style={{ width: `${100}%` }}
              >
                <RangeSlider
                  style={{ cursor: "pointer" }}
                  axis="x"
                  onDragEnd={handleTrackDragEnd}
                  onChange={(x) => handleChangeRangeFn(x)}
                  styles={{
                    options: {
                      handleBorder: 0,
                      handleBorderRadius:
                        getMergedStyles.sliderHandleBorderRadius,
                      handleColor: getMergedStyles.sliderHandleColor,
                      handleSize: isMagnified ? handleSize + 4 : handleSize,
                      height: isMagnified
                        ? getMergedStyles.sliderHeight + 4
                        : getMergedStyles.sliderHeight + 4,
                      padding: 0,
                      rangeColor: getMergedStyles.sliderColor,
                      trackBorderRadius:
                        getMergedStyles.sliderTrackBorderRadius,
                      trackColor: "rgba(176, 176, 176, 0.3)",
                    },
                  }}
                  x={position}
                  xMin={0}
                  xMax={100}
                  xStep={0.9}
                />
              </div>
            </li>
            <li>
              <p class="has-text-grey-light">
                {millisToMinutesAndSeconds(
                  globalState.track && globalState.track.durationMs
                )}
              </p>
            </li>
          </ul>
        </div>
        <div class="ect-btns mt-1">
          <ul class="ect-btns__inner">
            <li class="ect-btns__list">
              <i
                ref={videoRef}
                onClick={toggleFullScreen2}
                class="ect-btns__icon fas fa-expand-alt has-text-grey-light"
              >
                <FontAwesomeIcon icon={faExpandAlt} />
              </i>
            </li>
            <li class="ect-btns__list">
              <i class="ect-btns__icon fas fa-list has-text-grey-light">
                <FontAwesomeIcon icon={faList} />
              </i>
            </li>
            <li class="ect-btns__list ect-btns__list--volume">
              <i class="ect-btns__icon fas fa-volume-up has-text-grey-light">
                <FontAwesomeIcon icon={faVolumeUp} />
              </i>
              <div class="ect-btns__bar" style={{ margin: "auto" }}>
                <RangeSlider
                  style={{ cursor: "pointer" }}
                  axis="x"
                  onDragEnd={handleVolumeDragEnd}
                  styles={{
                    options: {
                      handleBorderRadius: 12,
                      handleBorder: "1px solid  rgba(176, 176, 176, 0.4)",
                      handleColor: getMergedStyles.bgColor,
                      handleSize: 12,
                      padding: 0,
                      rangeColor: getMergedStyles.sliderColor,
                      trackColor: "rgba(176, 176, 176, 0.3)",
                      height: 5,
                    },
                  }}
                  onChange={handleChangeVolume}
                  x={volume * 100}
                  xMin={0}
                  xMax={100}
                />
              </div>
            </li>
            <li class="ect-btns__list">
              <i
                class="ect-btns__icon fas fa-expand-alt has-text-grey-light"
                onClick={toggleFullScreen}
              >
                <FontAwesomeIcon icon={faExpandAlt} />
              </i>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
})

const Player = (props) => {
  const history = useHistory()
  const { globalState } = useContext(PlayerContext)
  const backgroundStyles = {
    backgroundImage: `url(${
      globalState && globalState.album && globalState.album.images[0].url
    })`,
  }

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
  }

  return (
    <div className="App">
      <div className="main-wrapper">
        <div className="now-playing__side">
          <img
            crossOrigin={"anonymous"}
            alt={""}
            src={globalState && globalState.track && globalState.track.image}
            class="wi-220px m0 dib p0 di"
          />
          <div className="now-playing__name">
            {globalState.track && globalState.track.name}
          </div>
          <div className="now-playing__artist">
            {globalState &&
              globalState.track &&
              globalState.track.artistsArray &&
              globalState.track.artistsArray.map((d, index) => {
                return (
                  <span
                    class={
                      index == 0
                        ? "album-cover__artist has-text-grey-light"
                        : "album-cover__artist ml-1 has-text-grey-light"
                    }
                    onClick={() => {
                      history.push(`/artist/${d.id}`)
                    }}
                  >
                    {d.name}
                  </span>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
