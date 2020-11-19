import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import { useSpring, a, config } from "react-spring"
import { useDrag } from "react-use-gesture"
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
  faHome,
} from "@fortawesome/free-solid-svg-icons"

import volumeIcon from "../.././images/volume.svg"

import { millisToMinutesAndSeconds } from "../../utils/utils"

import RangeSlider from "@gilbarbara/react-range-slider"
import { IRangeSliderPosition } from "@gilbarbara/react-range-slider/lib/types"
const height = 380
export const PlayerControlMobile = (props) => {
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

  return (
    <div>
      <div class="album-cover" onClick={open}>
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
      <div
        class="columns is-mobile has-text-black has-text-centered mb-2 mt-2"
        style={{ borderTop: `${1}px solid grey` }}
      >
        <div class="column">
          <FontAwesomeIcon icon={faHome} />
        </div>
        <div class="column">
          <FontAwesomeIcon icon={faList} />
        </div>
        <div class="column">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <div class="column"></div>
      </div>

      {/* <a.div className="bg" onClick={() => close()} style={bgStyle}></a.div> */}
      <a.div
        className="sheet"
        {...bind()}
        style={{
          display,
          bottom: `calc(-100vh + ${height - 100}px)`,
          y,
          background: playerBackground,
        }}
      >
        <div class="album-cover">
          <div>
            <img
              crossOrigin={"anonymous"}
              ref={imgRef}
              alt={""}
              src={globalState && globalState.track && globalState.track.image}
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
        <div class="play-btns mt-6">
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
                      trackBorderRadius:
                        getMergedStyles.sliderTrackBorderRadius,
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
      </a.div>
    </div>
  )
}
