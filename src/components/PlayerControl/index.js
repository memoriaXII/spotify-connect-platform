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

import volumeIcon from "../.././images/volume.svg"

import { millisToMinutesAndSeconds } from "../../utils/utils"

import RangeSlider from "@gilbarbara/react-range-slider"
import { IRangeSliderPosition } from "@gilbarbara/react-range-slider/lib/types"

export const PlayerControl = (props) => {
  const [isMagnified, setMagnified] = useState(true)
  const {
    imgRef,
    playerBackground,
    setDeviceVolume,
    globalState,
    currentPlayingState,
    userCurrentPlayingTrack,
    progressBarStyles,
    playFn,
    authToken,
    onChangeRange,
  } = props
  const { position, volume } = globalState
  const [utilsState, setUtilsState] = useState({
    isOpen: false,
    volume: volume,
  })

  var timeout
  const getMergedStyles = {
    altColor: "#ccc",
    bgColor: "#fff",
    color: "#333",
    errorColor: "#a60000",
    height: 40,
    loaderColor: "#ccc",
    loaderSize: 32,
    savedColor: "#1cb954",
    sliderColor: "#666",
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

  const handleChangeRange = async ({ x }) => {
    onChangeRange(x)
  }
  const handleChangeSlider = ({ x }) => {
    const volume = Math.round(x) / 100
    // timeout = setInterval(() => {
    //   setDeviceVolume(volume)
    // }, 1000)
    // clearTimeout(timeout)
    // timeout = window.setTimeout(() => {
    //   setDeviceVolume(volume)
    // }, 250)
    setDeviceVolume(volume, globalState.currentDeviceId)
    setUtilsState({ volume: volume })
    // return () => clearInterval(timeout)
  }

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

  return (
    <div class="playbar">
      <div class="album-cover">
        <div class="album-cover__img">
          <img
            crossOrigin={"anonymous"}
            ref={imgRef}
            alt={"example"}
            src={globalState && globalState.track && globalState.track.image}
            class="wi-220px m0 dib p0 di"
          />
        </div>
        <div class="album-cover__text-box">
          <div class="album-cover__wrap">
            <p
              class="album-cover__title truncate"
              style={{ fontSize: 12, width: 200 }}
            >
              {globalState && globalState.track && globalState.track.name}
            </p>
            <div class="album-cover__icon-box">
              {/* <i class="album-cover__icon far fa-heart">
                        <FontAwesomeIcon icon={faHeart} />
                      </i>
                      <i class="album-cover__icon fas fa-ban has-text-grey-light">
                        <FontAwesomeIcon icon={faBan} />
                      </i> */}
            </div>
          </div>
          <div>
            <p class="album-cover__artist">
              {globalState && globalState.track && globalState.track.artists}
            </p>
          </div>
        </div>
      </div>
      <div class="play-btns">
        <ul class="play-btns__wrap play-btns__icon-box">
          <li class="play-btns__list">
            <i class="play-btns__icon fas fa-random has-text-grey-light">
              <FontAwesomeIcon icon={faRandom} />
            </i>
          </li>
          <li class="play-btns__list">
            <i
              class="play-btns__icon fas fa-step-backward has-text-grey-light"
              onClick={() => {
                previousFn(authToken)
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
                  pauseFn(authToken)
                }}
              >
                <FontAwesomeIcon icon={faPause} />
              </i>
            ) : (
              <i
                class="play-btns__icon far fa-play-circle"
                onClick={() => {
                  playFn(authToken, globalState.currentDeviceId)
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
                nextFn(authToken)
              }}
            >
              <FontAwesomeIcon icon={faForward} />
            </i>
          </li>
          <li class="play-btns__list">
            <i class="play-btns__icon fas fa-sync has-text-grey-light">
              <FontAwesomeIcon icon={faSync} />
            </i>
          </li>
        </ul>
        <ul class="play-btns__wrap play-btns__range-bar">
          <li>
            <p class="has-text-grey-light">
              {globalState.isPlaying
                ? millisToMinutesAndSeconds(globalState.progressMs)
                : millisToMinutesAndSeconds(globalState.progressMs)}
            </p>
          </li>
          <li class="play-btns__bar">
            {/* <input type="range" value="60" min="0" max="100" /> */}
            <div
              onMouseEnter={mouseEnter}
              onMouseLeave={mouseLeave}
              style={{ width: `${100}%` }}
            >
              <RangeSlider
                style={{ cursor: "pointer" }}
                axis="x"
                onChange={handleChangeRange}
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
                xStep={0.1}
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
                : millisToMinutesAndSeconds(
                    userCurrentPlayingTrack &&
                      userCurrentPlayingTrack.duration_ms
                  )}
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
          <li class="ect-btns__list">
            <i class="ect-btns__icon fas fa-mobile-alt has-text-grey-light">
              <FontAwesomeIcon icon={faMobile} />
            </i>
          </li>
          <li class="ect-btns__list ect-btns__list--volume">
            <i class="ect-btns__icon fas fa-volume-up has-text-grey-light">
              <FontAwesomeIcon icon={faVolumeUp} />
            </i>
            <div class="ect-btns__bar" style={{ margin: "auto" }}>
              {/* <input type="range" value="100" min="0" max="100" /> */}
              <RangeSlider
                style={{ cursor: "pointer" }}
                axis="x"
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
                onChange={handleChangeSlider}
                // onDragEnd={handleDragEndSlider}
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

//  ;<div
//    class="player__controls bg-gray b0 btop bsolid bcdefault p6 "
//    style={{
//      position: "fixed",
//      bottom: 0,
//      zIndex: 101,
//    }}
//  >
//    <div class="dt tl-fixed wi-100">
//      <div class="dtc tl-fixed pl1 wi-210px">
//        <div class="dtc wi-50">
//          <span
//            class="icon icon--small"
//            onClick={() => {
//              previousFn(authToken)
//            }}
//            style={{ color: "grey", cursor: "pointer" }}
//          >
//            <FontAwesomeIcon icon={faBackward} />
//          </span>
//          <div class=" dib  bwidth p1 play ml2  mr2">
//            {globalState.isPlaying ? (
//              <span
//                class="icon icon--small"
//                onClick={() => {
//                  pauseFn(authToken)
//                }}
//              >
//                <FontAwesomeIcon icon={faPause} />
//              </span>
//            ) : (
//              <span
//                class="icon icon--small"
//                onClick={() => {
//                  playFn(authToken, globalState.currentDeviceId)
//                }}
//              >
//                <FontAwesomeIcon icon={faPlayCircle} />
//              </span>
//            )}
//            {/* {globalState.isPlaying ? (

//               ) : currentPlayingState && currentPlayingState.is_playing ? (
//                 <span
//                   class="icon icon--small"
//                   onClick={() => {
//                     pauseFn(authToken)
//                   }}
//                 >
//                   <FontAwesomeIcon icon={faPause} />
//                 </span>
//               ) : (
//                 <span
//                   class="icon icon--small"
//                   onClick={() => {
//                     playFn(authToken, globalState.currentDeviceId)
//                   }}
//                 >
//                   <FontAwesomeIcon icon={faPlayCircle} />
//                 </span>
//               )} */}
//          </div>
//          <span
//            class="icon icon--small"
//            style={{ color: "grey", cursor: "pointer" }}
//            onClick={() => {
//              nextFn(authToken)
//            }}
//          >
//            <FontAwesomeIcon icon={faForward} />
//          </span>
//        </div>
//        <div class="dtc wi-100">
//          {/* <input
//               type="range"
//               name="points"
//               min="1"
//               max="100"
//               value="100"
//               class="va-middle mr1 ml1 wi-100 rangeSlider"
//             /> */}
//          <RangeSlider
//            style={{ cursor: "pointer" }}
//            axis="x"
//            class="va-middle mr1 ml-5  wi-100"
//            styles={{
//              options: {
//                handleBorderRadius: 12,
//                handleColor: getMergedStyles.bgColor,
//                handleSize: 12,
//                padding: 0,
//                rangeColor: getMergedStyles.altColor || "#ccc",
//                trackColor: getMergedStyles.color,
//                height: 5,
//              },
//            }}
//            onChange={handleChangeSlider}
//            // onDragEnd={handleDragEndSlider}
//            x={volume * 100}
//            xMin={0}
//            xMax={100}
//          />
//        </div>
//      </div>
//      <div class="dtc pl2">
//        <div class="dt tl-fixed">
//          <div class="dtc">
//            <img class="icon icon--small" src={volumeIcon} alt="" />
//            {/* <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-gray"><use xlink:href="#volume"></use></svg> */}
//          </div>
//          <div class="dtc">
//            <p class="m0 p0 pl1 ml2 mr2 ml2 text-white dib fss">
//              {globalState.isPlaying
//                ? millisToMinutesAndSeconds(globalState.progressMs)
//                : millisToMinutesAndSeconds(globalState.progressMs)}
//            </p>
//            {/* <p class="m0 p0 mr1 ml2 text-white dib fss">{{ 0 | date : 'm:ss' }}</p> */}
//          </div>

//          <div
//            class="dtc"
//            onMouseEnter={mouseEnter}
//            onMouseLeave={mouseLeave}
//            style={{ width: `${92}%` }}
//          >
//            <RangeSlider
//              style={{ cursor: "pointer" }}
//              axis="x"
//              onChange={handleChangeRange}
//              styles={{
//                options: {
//                  handleBorder: 0,
//                  handleBorderRadius: getMergedStyles.sliderHandleBorderRadius,
//                  handleColor: getMergedStyles.sliderHandleColor,
//                  handleSize: isMagnified ? handleSize + 4 : handleSize,
//                  height: isMagnified
//                    ? getMergedStyles.sliderHeight + 4
//                    : getMergedStyles.sliderHeight + 4,
//                  padding: 0,
//                  rangeColor: getMergedStyles.sliderColor,
//                  trackBorderRadius: getMergedStyles.sliderTrackBorderRadius,
//                  trackColor: getMergedStyles.sliderTrackColor,
//                },
//              }}
//              x={position}
//              xMin={0}
//              xMax={100}
//              xStep={0.1}
//            />
//          </div>
//          <div class="dtc">
//            <p class="m0 p0 pl1 ml2 mr2 ml2 text-white dib fss">
//              {globalState.isPlaying
//                ? millisToMinutesAndSeconds(
//                    globalState &&
//                      globalState.track &&
//                      globalState.track.durationMs
//                  )
//                : millisToMinutesAndSeconds(
//                    userCurrentPlayingTrack &&
//                      userCurrentPlayingTrack.duration_ms
//                  )}
//            </p>
//          </div>
//        </div>
//      </div>
//    </div>
//    <div class="dtc tl-fixed tar pr1 wi-50px">
//      {/* <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-white va-middle"><use xlink:href="#shuffle"></use></svg>
//           <svg x="0px" y="0px" viewBox="0 0 30 30" class="icon icon--small fill-green ml1 va-middle"><use xlink:href="#repeat"></use></svg> */}
//    </div>
//  </div>
