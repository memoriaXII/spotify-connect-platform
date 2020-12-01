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
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")

  const getSinglePlaylistDes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/playlists/${id}`
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
        setPlaylistInfo(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }
  const getSinglePlaylistTracks = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/playlists/${id}/tracks`
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
        setPlaylistTracks(response.data.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useLayoutEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getSinglePlaylistDes(getToken(), props.match.params.id)
      getSinglePlaylistTracks(getToken(), props.match.params.id)
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
    if (playlistInfo && playlistInfo.images) {
      const colorThief = new ColorThief()
      const img = playlistRef.current
      img.onload = () => {
        // image  has been loaded
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        console.log(rgbToHex(result[0], result[1], result[2]), "test")
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
  }, [playlistInfo])

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            // background: `linear-gradient( to right bottom ,rgba(0,0,0,0.0),${playlistBackground} 95%,${playlistBackground})`,
            height: 290,
          }}
        ></div>
        <div
          class="summary__img"
          style={{
            backgroundImage: `url(${
              playlistInfo && playlistInfo.images && playlistInfo.images[0].url
            })`,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <span class="summary__text--black summary__text--for-me">
                  {playlistInfo &&
                    playlistInfo.type &&
                    playlistInfo.type.toUpperCase()}
                </span>
              </li>
              <li>
                <strong class="summary__text--title has-text-black">
                  {playlistInfo.name}
                </strong>
              </li>
              <li>
                <p class="will-hidden has-text-grey-light">
                  {playlistInfo.description}
                </p>
              </li>
              <li class="summary__text--by-spotify has-text-grey-light">
                <p>
                  Created by
                  <span class="summary__text--black">
                    {playlistInfo.owner && playlistInfo.owner.display_name}
                  </span>
                  &bull; 30 songs, 1 hr 49 min
                </p>
              </li>
            </ul>
          </div>
          <div class="buttons mt-5">
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
          src={
            playlistInfo && playlistInfo.images && playlistInfo.images[0].url
          }
        />
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  {playlistInfo.name}
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
      <div class="main__wrap mt-3">
        <table class="playlist">
          <colgroup>
            <col width="3%" />
            <col width="3%" />
            <col width="35%" />
            <col width="23%" />
            <col width="23%" />
            <col width="7%" />
            <col width="3%" />
            <col width="3%" />
          </colgroup>
          <tr class="playlist__tr">
            <th class="playlist__th"></th>
            <th class="playlist__th"></th>
            <th class="playlist__th">TITLE</th>
            <th class="playlist__th">ALBUM</th>
            <th class="playlist__th">LENGTH</th>
            <th class="playlist__th">
              <i class="far fa-calendar-alt"></i>
            </th>
            <th class="playlist__th"></th>
            <th class="playlist__th"></th>
          </tr>

          {playlistTracks.map((item, index) => {
            return (
              <tr
                class={
                  globalState.track && globalState.track.id == item.track.id
                    ? "playlist__tr nowplay"
                    : "playlist__tr "
                }
                key={index}
                onClick={async (e) => {
                  e.stopPropagation()
                  await playFn(
                    getToken(),
                    globalState.currentDeviceId,
                    item.track.uri
                  )
                }}
              >
                <td
                  class="playlist__td playlist__td--play"
                  style={{ verticalAlign: "middle" }}
                >
                  {globalState.track &&
                  globalState.track.id == item.track.id ? (
                    <SoundEqualizer />
                  ) : (
                    <FontAwesomeIcon icon={faPlay} style={{ color: "grey" }} />
                  )}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <img
                    style={{ borderRadius: 5 }}
                    src={item.track.album.images[0].url}
                    alt=""
                  />
                </td>
                <td class="playlist__td playlist__td--title title is-7 has-text-weight-normal">
                  {item.track.name}

                  <p class="mt-2 ">
                    {item.track.artists.map((d) => d.name).join(", ")}
                  </p>
                </td>

                <td
                  class="playlist__td playlist__td--artist "
                  style={{
                    fontSize: 12,
                    margin: "auto",
                    verticalAlign: "middle",
                  }}
                >
                  {item.track.album.name}
                </td>
                <td
                  class="playlist__td playlist__td--hour title is-7"
                  style={{
                    verticalAlign: "middle",
                  }}
                >
                  {millisToMinutesAndSeconds(item.track.duration_ms)}
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
        </table>
      </div>
    </div>
  )
}
