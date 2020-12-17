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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisH, faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import { millisToMinutesAndSeconds } from "../../utils/utils"

import AlbumContainer from "../../AlbumContainer"

import { SoundEqualizer } from "../../components/SoundEqualizer"

import { AuthContext } from "../../context/auth"
import { PlayerContext } from "../../context/player"

import ColorThief from "colorthief"

import soundChartIcon from "../../images/soundChart.svg"
import { useHistory } from "react-router-dom"

export default (props) => {
  const history = useHistory()
  const { getToken } = useContext(AuthContext)
  const { trimHeader, setTrimHeader } = props
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [albumInfo, setAlbumInfo] = useState({})
  const [albumTracks, setAlbumTracks] = useState([])
  const [relatedAlbums, setRelatedAlbums] = useState([])
  const [albumBackground, setAlbumBackground] = useState("")
  const albumRef = useRef(null)
  const playlistRef = useRef(null)

  const getSingleAlbumDes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/albums/${id}`
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
        setAlbumInfo(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }
  const getSingleAlbumTracks = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/albums/${id}/tracks`
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
        setAlbumTracks(response.data.items)
        getRelatedAlbums(getToken(), response.data.items[0].artists[0].id)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getRelatedAlbums = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/artists/${id}/albums`
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
            response.data.items.findIndex((elem) => elem.name === ele.name)
        )
        setRelatedAlbums(cleanArtistAlbumsArray)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getSingleAlbumDes(getToken(), props.match.params.id)
      getSingleAlbumTracks(getToken(), props.match.params.id)
    }
  }, [getToken(), props.match.params.id])

  useEffect(() => {
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    if (albumInfo && albumInfo.images) {
      const colorThief = new ColorThief()
      const img = albumRef.current
      img.onload = () => {
        // image  has been loaded
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        setAlbumBackground(rgbToHex(result[0], result[1], result[2]))
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
  }, [albumInfo])

  const HoursCounter = () => {
    let totalDuration = albumTracks.reduce((sum, eachSong) => {
      return sum + eachSong.duration_ms
    }, 0)
    return (
      <span class="has-text-grey-light">
        {millisToMinutesAndSeconds2(totalDuration)}
      </span>
    )
  }

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
      (seconds2 > 1 && minutes2 < 10 ? seconds2 + " sec" : "")
    )
  }

  return (
    <div>
      <div class="main__wrap summary">
        <div class="summary__banner"></div>
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(243, 121, 221, 0),
              rgba(28, 29, 29, 0.9)
              ),
            url(${albumInfo && albumInfo.images && albumInfo.images[0].url})`,
            height: 290,
          }}
        ></div>
        <div
          class="summary__img"
          style={{
            backgroundImage: `url(${
              albumInfo && albumInfo.images && albumInfo.images[0].url
            })`,
          }}
        ></div>

        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <span class="summary__text--black summary__text--for-me has-text-grey-light">
                  {albumInfo && albumInfo.type && albumInfo.type.toUpperCase()}
                </span>
              </li>
              <li>
                <strong class="summary__text--title has-text-white">
                  {albumInfo.name}
                </strong>
              </li>
              <li>
                <p class="will-hidden has-text-grey-light">
                  {albumInfo.description}
                </p>
              </li>
              <li class="summary__text--by-spotify has-text-grey">
                <p class="has-text-grey-light">
                  By
                  <span class="summary__text--white ml-1 mr-1">
                    {albumInfo &&
                      albumInfo.artists &&
                      albumInfo.artists.map((item, index) => {
                        return (
                          <span
                            class="ml-1"
                            onClick={() => {
                              history.push(`/artist/${item.id}`)
                            }}
                            key={index}
                          >
                            {item.name}
                          </span>
                        )
                      })}
                  </span>
                  &bull; 30 songs, <HoursCounter />
                </p>
              </li>
            </ul>
          </div>
          {globalState &&
          globalState.track &&
          globalState.isPlaying &&
          globalState.track.album &&
          globalState.track.album.uri ==
            (albumInfo && albumInfo.uri && albumInfo.uri) ? (
            <>
              <button
                class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                onClick={async (e) => {
                  e.stopPropagation()
                  await pauseFn(getToken())
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
                  e.stopPropagation()
                  await playFn(
                    getToken(),
                    globalState.currentDeviceId,
                    "",
                    albumTracks
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
          ref={albumRef}
          alt={""}
          src={albumInfo && albumInfo.images && albumInfo.images[0].url}
        />

        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  {albumInfo.name}
                </strong>
              </li>
            </ul>
          </div>

          <div class="buttons mt-5">
            {globalState &&
            globalState.track &&
            globalState.isPlaying &&
            globalState.track.album &&
            globalState.track.album.uri ==
              (albumInfo && albumInfo.uri && albumInfo.uri) ? (
              <>
                <button
                  class="button has-text-black has-text-centered has-text-weight-bold is-small is-rounded"
                  onClick={async (e) => {
                    await pauseFn(getToken())
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
                      albumTracks
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
        </div>
      </div>
      <div class="main__wrap mt-5">
        <table class="playlist">
          <colgroup>
            <col width="5%" />
            <col width="5%" />
            <col width="35%" />
            <col width="23%" />
            <col width="23%" />
            <col width="7%" />
            <col width="3%" />
            <col width="3%" />
          </colgroup>
          <tr class="playlist__tr">
            <th class="playlist__th"></th>
            <th class="playlist__th">Title</th>
            <th class="playlist__th">Artist</th>
            <th class="playlist__th">LENGTH</th>
            <th class="playlist__th">
              <i class="far fa-calendar-alt"></i>
            </th>
            <th class="playlist__th"></th>
            <th class="playlist__th"></th>
          </tr>

          {albumTracks.map((item, index) => {
            return (
              <tr
                class={
                  globalState.isPlaying &&
                  globalState.track &&
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
                  {globalState.track && globalState.track.id == item.id ? (
                    <SoundEqualizer />
                  ) : (
                    <FontAwesomeIcon
                      icon={faPlay}
                      class="icon has-text-grey-light is-small"
                    />
                  )}
                </td>
                <td
                  class="playlist__td playlist__td--title title is-7 has-text-weight-normal"
                  style={{
                    fontSize: 12,
                    margin: "auto",
                    verticalAlign: "middle",
                  }}
                >
                  {item.name}
                </td>

                <td
                  class="playlist__td playlist__td--artist"
                  style={{
                    fontSize: 12,
                    margin: "auto",
                    verticalAlign: "middle",
                  }}
                >
                  <p>{item.artists.map((d) => d.name).join(", ")}</p>
                </td>
                <td
                  class="playlist__td playlist__td--hour title is-7"
                  style={{
                    verticalAlign: "middle",
                  }}
                >
                  {millisToMinutesAndSeconds(item.duration_ms)}
                </td>

                <td
                  class="playlist__td playlist__td--more"
                  style={{ verticalAlign: "middle" }}
                >
                  <FontAwesomeIcon
                    icon={faEllipsisH}
                    style={{ color: "grey" }}
                  />
                </td>
              </tr>
            )
          })}
        </table>
      </div>
      <hr />

      <AlbumContainer
        globalState={globalState}
        newReleaseData={relatedAlbums}
        isArtistAlbum={true}
      />
    </div>
  )
}
