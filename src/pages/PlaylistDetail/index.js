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

export default (props) => {
  const { trimHeader, authToken, setTrimHeader } = props

  const [playlistInfo, setPlaylistInfo] = useState({})
  const [playlistTracks, setPlaylistTracks] = useState([])

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
        console.log(response.data.items, "playlist content")
        setPlaylistTracks(response.data.items)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useLayoutEffect(() => {
    setTrimHeader(false)
    if (authToken) {
      getSinglePlaylistDes(authToken, props.match.params.id)
      getSinglePlaylistTracks(authToken, props.match.params.id)
    }
  }, [authToken, props.match.params.id])

  return (
    <div>
      <div class="main__wrap summary">
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
                <strong class="summary__text--title">
                  {playlistInfo.name}
                </strong>
              </li>
              <li>
                <p class="will-hidden has-text-grey">
                  {playlistInfo.description}
                </p>
              </li>
              <li class="summary__text--by-spotify has-text-grey">
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
                <strong class="summary__text--title title is-4">
                  {playlistInfo.name}
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
      <div class="main__wrap">
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
              <tr class="playlist__tr" key={index}>
                <td
                  class="playlist__td playlist__td--play"
                  style={{ verticalAlign: "middle" }}
                >
                  <FontAwesomeIcon icon={faPlay} style={{ color: "grey" }} />
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

                  <p class="mt-2 has-text-grey">
                    {item.track.artists.map((d) => d.name).join(", ")}
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
  )
}
