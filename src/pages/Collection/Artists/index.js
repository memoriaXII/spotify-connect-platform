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
  const [current, setCurrent] = useState("")
  const [afterRowsID, setAfterRowsID] = useState("")

  const handleNext = (value) => {
    setCurrent(value)
  }
  useEffect(() => {
    getSavedArtists(getToken(), current)
  }, [current])

  const getSavedArtists = (validateToken, currentValue) => {
    const afterCondition = currentValue == "" ? `` : `&after=${currentValue}`
    const url = `https://api.spotify.com/v1/me/following?type=artist&limit=12${afterCondition}`
    let previousArtistArray = []
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
        previousArtistArray.push(
          ...savedArtists,
          ...response.data.artists.items
        )
        console.log(response.data.artists, "response.data.artists")
        setAfterRowsID(response.data.artists.cursors.after)
        setSavedArtists(previousArtistArray)
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
    // if (getToken()) {
    //   getSavedArtists(getToken(), props.match.params.id)
    // }
  }, [getToken(), props.match.params.id])

  const buildItems = () => {
    return (
      savedArtists &&
      savedArtists.map((item, index) => {
        return (
          <div class="column is-2 album__item" key={index}>
            <div
              class="album__item__image__wrapper"
              style={{ borderRadius: `${50}%` }}
              onClick={() => {
                history.push(`/artist/${item.id}`)
              }}
            >
              <img
                style={{ borderRadius: `${50}%` }}
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
            <div class="has-text-centered">
              <p class="title is-6 has-text-centered mt-2 has-text-black">
                {item && item.name}
              </p>
            </div>
          </div>
        )
      })
    )
  }

  return (
    <div>
      <div class="main__wrap summary">
        <div class="summary__box" style={{ height: 90 }}>
          <div class="summary__text">
            <ul>
              <li>
                <strong class="summary__text--title has-text-black">
                  Artists
                </strong>
              </li>
            </ul>
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
        <div class="columns is-multiline">
          {buildItems()}
          {afterRowsID ? (
            <p class="mt-2 mb-2 has-text-centered" style={{ width: `${100}%` }}>
              <button
                class="button is-light is-outlined has-text-grey"
                onClick={() => {
                  console.log(afterRowsID)
                  handleNext(afterRowsID)
                }}
              >
                Load More
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
