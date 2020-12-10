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
import { millisToMinutesAndSeconds } from "../../utils/utils"
import { AuthContext } from "../../context/auth"
import { PlayerContext } from "../../context/player"

import { SoundEqualizer } from "../../components/SoundEqualizer"

export default (props) => {
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [showInfo, setShowInfo] = useState({})
  const [playlistImages, setPlaylistImages] = useState([])
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [showEpisodes, setShowEpisodes] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")

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
            background: `linear-gradient(
              to bottom,
              rgba(243, 121, 221, 0),
              rgba(28, 29, 29, 0.9)
              ),
            url(${showInfo && showInfo.images && showInfo.images[0].url})`,
            height: 350,
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
            {isPlayingPlaylist ? (
              <>
                <button
                  class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                  onClick={(e) => {
                    pauseFn(getToken())
                  }}
                >
                  <FontAwesomeIcon icon={faPause} />
                  <span class="ml-2">Pause</span>
                </button>
              </>
            ) : (
              <>
                <button
                  class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                  onClick={async (e) => {
                    await playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      "",
                      playlistTracks
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
              </>
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
                <div class="column is-2">
                  <img
                    style={{ borderRadius: 5, width: 200 }}
                    src={item && item.images[0].url}
                    alt=""
                  />
                </div>
                <div class="column is-10">
                  <span class="has-text-blck title is-6"> {item.name}</span>
                  <p class="line-clamp-text">{item.description}</p>
                  <div class="buttons">
                    <button class="button is-white">
                      <FontAwesomeIcon
                        icon={faPlay}
                        style={{ color: "grey" }}
                      />
                    </button>
                    <span class="has-text-grey title is-7">
                      {millisToMinutesAndSeconds(item.duration_ms)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

        {/* {showEpisodes &&
            showEpisodes.map((item, index) => {
              return (
                <tr
                  class={
                    globalState.track &&
                    globalState.track.id &&
                    globalState.track.id == item.id
                      ? "playlist__tr nowplay"
                      : "playlist__tr "
                  }
                  key={index}
                  onClick={async (e) => {
                    e.stopPropagation()
                    await playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      item.uri
                    )
                  }}
                >
                  <td
                    class="playlist__td playlist__td--play"
                    style={{ verticalAlign: "middle" }}
                  >
                    {globalState &&
                    globalState.id &&
                    globalState.id == item.id ? (
                      <SoundEqualizer />
                    ) : (
                      <FontAwesomeIcon
                        icon={faPlay}
                        style={{ color: "grey" }}
                      />
                    )}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <img
                      style={{ borderRadius: 5 }}
                      src={item && item.images[0].url}
                      alt=""
                    />
                  </td>
                  <td class="playlist__td playlist__td--title title is-7 has-text-weight-normal">
                    {item && item.name}
                  </td>

                  <td
                    class="playlist__td playlist__td--artist "
                    style={{
                      fontSize: 12,
                      margin: "auto",
                      verticalAlign: "middle",
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    class="playlist__td playlist__td--hour title is-7"
                    style={{
                      verticalAlign: "middle",
                    }}
                  >
                    {millisToMinutesAndSeconds(item.duration_ms)}
                  </td>
                  <td class="playlist__td playlist__td--dislike"></td>
                  <td
                    class="playlist__td playlist__td--more"
                    style={{ verticalAlign: "middle" }}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </td>
                </tr>
              )
            })}
      */}
      </div>
    </div>
  )
}
