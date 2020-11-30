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
import { useHistory } from "react-router-dom"

export default (props) => {
  const history = useHistory()
  const playlistRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [savedArtists, setSavedArtists] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")

  const getSavedArtists = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/me/following?type=artist&limit=50`
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
        console.log(response, "savetracks")
        setSavedArtists(response.data.artists.items)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  async function getArtistSongs(validateToken, artistId) {
    return fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=TW`,
      {
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    ).then((d) => d.json())
  }

  useLayoutEffect(() => {
    setTrimHeader(false)
    if (getToken()) {
      getSavedArtists(getToken(), props.match.params.id)
    }
  }, [getToken(), props.match.params.id])

  const buildItems = () => {
    return (
      savedArtists &&
      savedArtists.map((item, index) => {
        return (
          <div class="column is-3 album__item" key={index}>
            <div
              class="album__item__image__wrapper"
              onClick={() => {
                history.push(`/artist/${item.id}`)
              }}
            >
              <img
                class="album__item__image"
                src={item && item.images[0].url}
                alt=""
              />
              <div class="album__item__play__artist__button">
                <a href="javascript:void(0)">
                  <button
                    class="button"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {globalState &&
                    globalState.isPlaying &&
                    globalState.track &&
                    globalState.track.artists &&
                    globalState.track.artists.includes(item && item.name) ? (
                      <FontAwesomeIcon
                        icon={faPause}
                        onClick={(e) => {
                          e.stopPropagation()
                          pauseFn(getToken())
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faPlay}
                        onClick={async (e) => {
                          e.stopPropagation()
                          const { tracks } = await getArtistSongs(
                            getToken(),
                            item.id
                          )
                          playFn(
                            getToken(),
                            globalState.currentDeviceId,
                            "",
                            tracks
                          )
                        }}
                      />
                    )}
                  </button>
                </a>
              </div>
            </div>
            <div class="album__item__description">
              <span class="album__item__title has-text-black">
                {item && item.name}
              </span>
              {/* <span class="album__item__subtitle">
                {item && item.artists[0].name}
              </span> */}
            </div>
          </div>
        )
      })
    )
  }

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient(to left top, #f3f2f7, #cec5cb, #aa9a9b, #83736a, #565040)`,
            height: 230,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title has-text-white">
                  Artists
                </strong>
              </li>
            </ul>
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
                <strong class="summary__text--title title is-4">Artists</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="main__wrap">
        <div class="columns is-multiline">{buildItems()}</div>
      </div>
    </div>
  )
}
