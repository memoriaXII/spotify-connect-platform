import React, {
  lazy,
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
import LazyLoad from "react-lazy-load"

const PlaylistTableContainer = lazy(() =>
  import("../../components/PlaylistTableContainer")
)

export default (props) => {
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [playlistImages, setPlaylistImages] = useState([])
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")

  const getSinglePlaylistImages = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/playlists/${id}/images`
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
        setPlaylistImages(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

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

  useEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getSinglePlaylistImages(getToken(), props.match.params.id)
      getSinglePlaylistDes(getToken(), props.match.params.id)
      getSinglePlaylistTracks(getToken(), props.match.params.id)
    }
  }, [getToken(), props.match.params.id])

  useEffect(() => {
    if (globalState && globalState.track && playlistTracks) {
      const hasMatch = playlistTracks.filter(function (value) {
        return value.track && value.track.id == globalState.track.id
      })

      if (hasMatch.length == 1 && globalState.isPlaying) {
        setPlayingPlaylistStatus(true)
      } else {
        setPlayingPlaylistStatus(false)
      }
    }
  }, [globalState, playlistTracks])

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
  }, [playlistInfo])

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(243, 121, 221, 0),
              rgba(28, 29, 29, 0.9) 80%
              ),
            url(${
              playlistImages && playlistImages[0] && playlistImages[0].url
            })`,
            height: 350,
          }}
        ></div>
        <div
          class="summary__img"
          style={{
            backgroundImage: `url(${
              playlistImages && playlistImages[0] && playlistImages[0].url
            })`,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <span class="summary__text--white summary__text--for-me">
                  {playlistInfo &&
                    playlistInfo.type &&
                    playlistInfo.type.toUpperCase()}
                </span>
              </li>
              <li>
                <strong class="summary__text--title has-text-white">
                  {playlistInfo.name}
                </strong>
              </li>
              <li>
                <p class="line-clamp-text has-text-white">
                  {playlistInfo.description}
                </p>
              </li>
              <li class="summary__text--by-spotify has-text-grey-light">
                <p>
                  Created by
                  <span class="summary__text--white ml-1 mr-1 is-cursor">
                    {playlistInfo.owner && playlistInfo.owner.display_name}
                  </span>
                  &bull; {playlistInfo.tracks && playlistInfo.tracks.total}
                  songs
                </p>
              </li>
            </ul>
          </div>
          <div class="buttons">
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
      <div class="main__wrap mt-6">
        <PlaylistTableContainer>
          {playlistTracks &&
            playlistTracks.map((item, index) => {
              return (
                <tr
                  class={
                    globalState.track &&
                    globalState.track &&
                    globalState.track.id &&
                    globalState.track.id == (item.track && item.track.id)
                      ? "playlist__tr nowplay"
                      : "playlist__tr "
                  }
                  key={index}
                  onClick={async (e) => {
                    e.stopPropagation()
                    await playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      item.track && item.track.uri
                    )
                  }}
                >
                  <td
                    class="playlist__td playlist__td--play"
                    style={{ verticalAlign: "middle" }}
                  >
                    {globalState.track &&
                    globalState.track &&
                    globalState.track.id &&
                    globalState.track.id == (item.track && item.track.id) ? (
                      <SoundEqualizer />
                    ) : (
                      <FontAwesomeIcon
                        icon={faPlay}
                        style={{ color: "grey" }}
                      />
                    )}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <LazyLoad debounce={false} offsetVertical={500}>
                      <img
                        style={{ borderRadius: 5 }}
                        src={
                          item.track &&
                          item.track.album &&
                          item.track.album.images[0].url
                        }
                        alt=""
                      />
                    </LazyLoad>
                  </td>
                  <td class="playlist__td playlist__td--title title is-7 has-text-weight-normal">
                    {item.track && item.track.name}

                    <p class="mt-2 ">
                      {item.track &&
                        item.track.artists.map((d) => d.name).join(", ")}
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
                    {item.track && item.track.album && item.track.album.name}
                  </td>
                  <td
                    class="playlist__td playlist__td--hour title is-7"
                    style={{
                      verticalAlign: "middle",
                    }}
                  >
                    {millisToMinutesAndSeconds(
                      item.track && item.track.duration_ms
                    )}
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
        </PlaylistTableContainer>
      </div>
    </div>
  )
}
