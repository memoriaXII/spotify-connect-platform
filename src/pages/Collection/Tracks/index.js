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

import { SoundEqualizer } from "../../../components/SoundEqualizer"

export default (props) => {
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [savedTracks, setSavedTracks] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")
  const [current, setCurrent] = useState(1)
  const handleNext = () => {
    setCurrent(current + 1)
  }
  useEffect(() => {
    setTrimHeader(false)
    getSavedTracks(getToken(), current)
  }, [current, getToken(), props.match.params.id])

  const getSavedTracks = (validateToken, currentValue) => {
    let previousArray = []
    const url = `https://api.spotify.com/v1/me/tracks?market=TW&limit=50&offset=${
      (currentValue - 1) * 10
    }`
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
        previousArray.push(...savedTracks, ...response.data.items)
        setSavedTracks(previousArray)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useEffect(() => {
    if (globalState && globalState.track) {
      const hasMatch = savedTracks.filter(function (value) {
        return value.track.id == globalState.track.id
      })

      if (hasMatch.length == 1 && globalState.isPlaying) {
        setPlayingPlaylistStatus(true)
      } else {
        setPlayingPlaylistStatus(false)
      }
    }
  }, [globalState])

  return (
    <div>
      <div class="main__wrap summary">
        <div class="summary__box" style={{ height: 120 }}>
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title has-text-black">
                  Liked Songs
                </strong>
              </li>
            </ul>
          </div>
          <div class="buttons mt-4">
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
                      savedTracks
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
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  Liked Songs
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
      <div class="main__wrap mt-5">
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

          {savedTracks.map((item, index) => {
            return (
              <tr
                class={
                  globalState.isPlaying &&
                  globalState.track &&
                  globalState.track.id == item.track.id
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
                    <FontAwesomeIcon
                      icon={faPlay}
                      style={{ color: "rgba(145, 143, 143, 0.3)" }}
                    />
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
        <p class="mt-2 mb-2 has-text-centered" style={{ width: `${100}%` }}>
          <button
            class="button is-light is-outlined has-text-grey"
            onClick={() => {
              handleNext()
            }}
          >
            Load More
          </button>
        </p>
      </div>
    </div>
  )
}
