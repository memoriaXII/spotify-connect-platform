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
import { faEllipsisH, faPlay } from "@fortawesome/free-solid-svg-icons"
import { millisToMinutesAndSeconds } from "../../utils/utils"
import AlbumContainer from "../../AlbumContainer"
import ColorThief from "colorthief"

export default (props) => {
  const { trimHeader, authToken } = props
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
        console.log(response.data.items, "artist")
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

  useLayoutEffect(() => {
    if (authToken) {
      getArtistAlbums(authToken, props.match.params.id)
      getArtistTopTracks(authToken, props.match.params.id)
      getArtistInfo(authToken, props.match.params.id)
      setArtistAlbumStatus(true)
    }
  }, [authToken, props.match.params.id])

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
      <div class="main__wrap summary">
        <div
          class="summary__banner"
          // style={{
          //   backgroundImage: `url(${
          //     artistInfo && artistInfo.images && artistInfo.images[0].url
          //   })`,
          // }}
        ></div>
        <div
          class="summary__bg"
          style={{
            background: artistBackground,
            // background: `linear-gradient(to top,  #e66465 10%, ${artistBackground} 20%`,
          }}
        ></div>
        <div
          class="summary__img"
          style={{
            backgroundImage: `url(${
              artistInfo && artistInfo.images && artistInfo.images[0].url
            })`,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <span class="summary__text--black summary__text--for-me">
                  {/* {playlistInfo &&
                    playlistInfo.type &&
                    playlistInfo.type.toUpperCase()} */}
                </span>
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
              {/* <li class="summary__text--by-spotify has-text-grey">
                <p>
                  Created by
                  <span class="summary__text--black">
                    {playlistInfo.owner && playlistInfo.owner.display_name}
                  </span>
                  &bull; 30 songs, 1 hr 49 min
                </p>
              </li> */}
            </ul>
          </div>
          <div class="buttons">
            <button
              class="button has-text-black has-text-centered has-text-weight-bold is-small"
              style={{ borderRadius: 5 }}
            >
              <FontAwesomeIcon
                icon={faPlay}
                class="icon  ml-1 mr-2"
                style={{ fontSize: 10 }}
              />
              Play
            </button>
            <button
              class="button  has-text-centered has-text-weight-bold is-small"
              style={{
                borderRadius: 5,
                border: `${1}px solid #601ce9`,
                color: "#601ce9",
              }}
            >
              Follow
            </button>
          </div>

          <div class="summary__button">
            {/* <ul class="button">
              <li class="button__list button__play-btn">
                <p class="button__text">PLAY</p>
              </li>
              <li class="button__list">
                <i class="button__icon far fa-heart"></i>
              </li>
              <li class="button__list">
                <i class="button__icon fas fa-ellipsis-h"></i>
              </li>
            </ul> */}
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
          alt={"example"}
          src={artistInfo && artistInfo.images && artistInfo.images[1].url}
        />
        {/* <div
              ref={artistRef}
              class="summary__img"
              style={{
                backgroundImage: `url(${
                  artistInfo && artistInfo.images && artistInfo.images[1].url
                })`,
              }}
            ></div> */}
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
          <div class="summary__button">
            <ul class="button" style={{ border: 0 }}>
              <li class="button__list button__play-btn has-text-black has-text-centered has-text-weight-bold is-small">
                <p class="button__text">PLAY</p>
                {/* <button class="button is-dark ">Play</button> */}
              </li>
              {/* <li class="button__list">
                <i class="button__icon far fa-heart"></i>
              </li>
              <li class="button__list">
                <i class="button__icon fas fa-ellipsis-h"></i>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
      <div class="columns mt-5">
        <div class="column is-2 mt-5">
          <p class="title is-5">Lastest Release</p>

          <img
            src={
              artistLastestRelease &&
              artistLastestRelease.images &&
              artistLastestRelease.images[0].url
            }
            alt=""
          />
          <p class="title is-6">{artistLastestRelease.name}</p>
          <p class="subtitle is-7">
            {artistLastestRelease &&
              artistLastestRelease.artists &&
              artistLastestRelease.artists.map((d) => d.name).join(", ")}
          </p>
        </div>
        <div class="column is-10">
          <div class="main__wrap mb-6 mt-5">
            <p class="title is-5">Popular</p>
            <table class="playlist">
              <colgroup>
                <col width="3%" />
                <col width="3%" />
                <col width="35%" />
                <col width="23%" />
                <col width="7%" />
                <col width="7%" />
                <col width="3%" />
                <col width="3%" />
              </colgroup>
              {/* <tr class="playlist__tr">
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
          </tr> */}

              {artistTopTracks.map((item, index) => {
                return (
                  <tr class="playlist__tr" key={index}>
                    <td
                      class="playlist__td playlist__td--play"
                      style={{ verticalAlign: "middle" }}
                    >
                      <FontAwesomeIcon
                        icon={faPlay}
                        style={{ color: "grey" }}
                      />
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

                      <p class="mt-2 has-text-grey">
                        {item.artists.map((d) => d.name).join(", ")}
                      </p>
                    </td>

                    <td
                      class="playlist__td playlist__td--artist has-text-grey"
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

      <AlbumContainer
        newReleaseData={artistAlbums}
        isArtistAlbum={isArtistAlbum}
      />
    </div>
  )
}
