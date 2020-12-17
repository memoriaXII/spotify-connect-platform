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
import ColorThief from "colorthief"

import soundChartIcon from "../../images/soundChart.svg"
import verifyIcon from "../../images/verified.svg"

import { SoundEqualizer } from "../../components/SoundEqualizer"

import { AuthContext } from "../../context/auth"
import { PlayerContext } from "../../context/player"
import { useHistory } from "react-router-dom"

export default (props) => {
  const history = useHistory()
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const { trimHeader, setTrimHeader, setGradientNum } = props

  const [playlistInfo, setPlaylistInfo] = useState({})
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [artistInfo, setArtistInfo] = useState({})
  const [artistTopTracks, setArtistTopTracks] = useState([])
  const [artistAlbums, setArtistAlbums] = useState([])
  const [isArtistAlbum, setArtistAlbumStatus] = useState(false)
  const [artistBackground, setArtistBackground] = useState("")
  const [artistLastestRelease, setArtistLastestRelease] = useState({})
  const artistRef = useRef(null)

  const getArtistInfo = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/artists/${id}`
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
        setArtistInfo(response.data)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  async function getArtistTopTracks(validateToken, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=TW`
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
        setArtistTopTracks(response.data.tracks)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  async function getArtistAlbums(validateToken, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`
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
        setArtistAlbums(cleanArtistAlbumsArray)
        let artistNewRelease = response.data.items.filter(
          (ele, ind) =>
            ind ===
            response.data.items.findIndex(
              (elem) => elem.release_date === ele.release_date
            )
        )
        setArtistLastestRelease(artistNewRelease[0])
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getArtistAlbums(getToken(), props.match.params.id)
      getArtistTopTracks(getToken(), props.match.params.id)
      getArtistInfo(getToken(), props.match.params.id)
      setArtistAlbumStatus(true)
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
    if (artistInfo && artistInfo.images) {
      const colorThief = new ColorThief()
      const img = artistRef.current
      img.onload = () => {
        // image  has been loaded
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        console.log(rgbToHex(result[0], result[1], result[2]), "test")
        setArtistBackground(rgbToHex(result[0], result[1], result[2]))
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
  }, [artistInfo])

  return (
    <div>
      <div class="summary">
        <div class="summary__banner"></div>
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient( to bottom ,rgba(0,0,0,0.1),${artistBackground} 90%),
            url(${
              artistInfo && artistInfo.images && artistInfo.images[0].url
            })`,
          }}
        ></div>

        <div class="summary__box mt-8" style={{ marginTop: 50 }}>
          <div class="summary__text">
            <ul>
              <li>
                <div class="columns">
                  <div class="column is-3">
                    <span class="summary__text--white summary__text--for-me">
                      Artist
                    </span>
                  </div>
                  <div class="column is-4 mt-1">
                    <img class="icon is-small" src={verifyIcon} alt="" />
                  </div>
                </div>
              </li>

              <li>
                <strong class="summary__text--title has-text-white">
                  {artistInfo.name}
                </strong>
              </li>
              <li>
                <p class="will-hidden has-text-grey">
                  {/* {playlistInfo.description} */}
                </p>
              </li>
            </ul>
          </div>
          <div class="buttons mt-5">
            {globalState &&
            globalState.isPlaying &&
            globalState.track &&
            globalState.track.artists &&
            globalState.track.artists.includes(
              artistInfo && artistInfo.name
            ) ? (
              <>
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
                      artistTopTracks
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

            <button
              class="button  has-text-centered has-text-weight-bold is-small is-rounded is-rounded has-text-white"
              style={{
                border: 0,
                background: "#3D83FF",
              }}
            >
              Follow
            </button>
          </div>
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
          ref={artistRef}
          alt={""}
          src={artistInfo && artistInfo.images && artistInfo.images[1].url}
        />

        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title title is-4">
                  {artistInfo.name}
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="columns mt-5 is-variable is-1">
        <div
          class="column is-2 mt-5"
          onClick={() => {
            history.push(`/album/${artistLastestRelease.id}`)
          }}
          style={{ cursor: "pointer" }}
        >
          <p class="title is-5">Lastest Release</p>
          <img
            src={
              artistLastestRelease &&
              artistLastestRelease.images &&
              artistLastestRelease.images[0].url
            }
            alt=""
          />
          <p class="title is-6 line-clamp-text has-text-black">
            {artistLastestRelease.name}
          </p>
          <p class="subtitle is-7 line-clamp-text">
            {artistLastestRelease &&
              artistLastestRelease.artists &&
              artistLastestRelease.artists.map((d) => d.name).join(", ")}
          </p>
        </div>
        <div class="column is-10">
          <div class="main__wrap mb-6 mt-5">
            <p class="title is-5 ml-5">Popular</p>
            <table class="playlist">
              <colgroup>
                <col width="3%" />
                <col width="5%" />
                <col width="35%" />
                <col width="23%" />
              </colgroup>

              {artistTopTracks.map((item, index) => {
                return (
                  <tr
                    class={
                      globalState.track && globalState.track.id == item.id
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
                          style={{ color: "grey" }}
                        />
                      )}
                    </td>

                    <td style={{ verticalAlign: "middle" }}>
                      <img
                        style={{ borderRadius: 5 }}
                        src={item.album.images[0].url}
                        alt=""
                      />
                    </td>
                    <td class="playlist__td playlist__td--title title is-7 has-text-weight-normal">
                      {item.name}

                      <p class="mt-2">
                        {item.artists.map((d) => d.name).join(", ")}
                      </p>
                    </td>

                    <td
                      class="playlist__td playlist__td--artist"
                      style={{
                        fontSize: 12,
                        margin: "auto",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.album.name}
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
        </div>
      </div>
      <hr />

      <AlbumContainer
        globalState={globalState}
        newReleaseData={artistAlbums}
        isArtistAlbum={isArtistAlbum}
      />
    </div>
  )
}
