import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import { PlaylistProvider } from "../../context/playlist"
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

import volumeIcon from "../.././images/volume.svg"
import ColorThief from "colorthief"
import { millisToMinutesAndSeconds } from "../../utils/utils"

import RangeSlider from "@gilbarbara/react-range-slider"
import { IRangeSliderPosition } from "@gilbarbara/react-range-slider/lib/types"
import { PlayerContext } from "../../context/player"
import { AuthContext } from "../../context/auth"
import { useHistory } from "react-router-dom"

export const PlayerControl = (props) => {
  let history = useHistory()
  const {
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
    sliderColor: "#0088FF",
    sliderHandleBorderRadius: "50%",
    sliderHandleColor: "#fff",
    sliderHeight: 0.5,
    sliderTrackBorderRadius: 0,
    sliderTrackColor: "#ccc",
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
  }, 500)

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

  return (
    <div class="playbar is-hidden-mobile">
      <div class="album-cover">
        <div class="album-cover__img">
          <img
            crossOrigin={"anonymous"}
            ref={imgRef}
            alt={""}
            src={globalState && globalState.track && globalState.track.image}
            class="wi-220px m0 dib p0 di"
          />
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
            {globalState &&
              globalState.track &&
              globalState.track.artistsArray &&
              globalState.track.artistsArray.map((d) => {
                return (
                  <span
                    class="album-cover__artist"
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
      <div class="play-btns">
        <ul class="play-btns__wrap play-btns__icon-box">
          <li class="play-btns__list">
            <i class="play-btns__icon fas fa-random has-text-grey-light">
              <FontAwesomeIcon
                icon={faRandom}
                style={{ color: globalState.isShuffled ? "#0088ff" : "" }}
              />
            </i>
          </li>
          <li class="play-btns__list">
            <i
              class="play-btns__icon fas fa-step-backward has-text-grey-light"
              onClick={() => {
                previousFn(getToken())
              }}
            >
              <FontAwesomeIcon icon={faBackward} />
            </i>
          </li>
          <li class="play-btns__list">
            {globalState.isPlaying ? (
              <i
                class="play-btns__icon far fa-play-circle"
                onClick={() => {
                  pauseFn(getToken())
                }}
              >
                <FontAwesomeIcon icon={faPause} />
              </i>
            ) : (
              <i
                class="play-btns__icon far fa-play-circle"
                onClick={() => {
                  playFn(getToken(), globalState.currentDeviceId)
                }}
              >
                <FontAwesomeIcon icon={faPlayCircle} />
              </i>
            )}
          </li>
          <li class="play-btns__list">
            <i
              class="play-btns__icon fas fa-step-forward has-text-grey-light"
              onClick={() => {
                nextFn(getToken())
              }}
            >
              <FontAwesomeIcon icon={faForward} />
            </i>
          </li>
          <li class="play-btns__list">
            <i class="play-btns__icon fas fa-sync has-text-grey-light">
              <FontAwesomeIcon
                icon={faSync}
                style={{ color: globalState.isRepeated ? "#0088ff" : "" }}
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
                    trackBorderRadius: getMergedStyles.sliderTrackBorderRadius,
                    trackColor: getMergedStyles.sliderTrackColor,
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
              {globalState.isPlaying
                ? millisToMinutesAndSeconds(
                    globalState &&
                      globalState.track &&
                      globalState.track.durationMs
                  )
                : millisToMinutesAndSeconds()}
            </p>
          </li>
        </ul>
      </div>
      <div class="ect-btns">
        <ul class="ect-btns__inner">
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
                    handleColor: getMergedStyles.bgColor,
                    handleSize: 12,
                    padding: 0,
                    rangeColor: getMergedStyles.altColor || "#ccc",
                    trackColor: getMergedStyles.color,
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
            <i class="ect-btns__icon fas fa-expand-alt has-text-grey-light">
              <FontAwesomeIcon icon={faExpandAlt} />
            </i>
          </li>
        </ul>
      </div>
    </div>
  )
}
