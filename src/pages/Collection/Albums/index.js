import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
  Component,
} from "react"
import { Flipper, Flipped, spring } from "react-flip-toolkit"
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
  const testRef = useRef(null)
  const { trimHeader, setTrimHeader } = props
  const { getToken } = useContext(AuthContext)
  const { globalState, playFn, pauseFn } = useContext(PlayerContext)
  const [playlistInfo, setPlaylistInfo] = useState({})
  const [saveAlbums, setSaveAlbums] = useState([])
  const [isPlayingPlaylist, setPlayingPlaylistStatus] = useState(false)
  const [playlistBackground, setPlaylistBackground] = useState("")
  const [current, setCurrent] = useState(1)

  const handleNext = () => {
    setCurrent(current + 1)
  }

  const [state, setstate] = useState({ focused: null })
  const onClick = (index) => {
    setstate({
      focused: state.focused === index ? null : index,
    })
  }

  useEffect(() => {
    getSaveAlbums(getToken(), current)
  }, [current])

  useEffect(() => {
    if (trimHeader) {
      onClick(0)
    } else {
      onClick(1)
    }
  }, [trimHeader])

  const getSaveAlbums = (validateToken, currentValue) => {
    let prevAlbumsArray = []
    const url = `https://api.spotify.com/v1/me/albums?market=TW&limit=12&offset=${
      (currentValue - 1) * 12
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
        prevAlbumsArray.push(...saveAlbums, ...response.data.items)
        setSaveAlbums(prevAlbumsArray)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const testScroll = () => {
    if (testRef && testRef.current && testRef.current.scrollTop) {
      if (
        testRef.current.scrollTop + testRef.current.clientHeight >=
        testRef.current.scrollHeight
      ) {
        handleNext()
      }
    }
  }

  useLayoutEffect(() => {
    window.addEventListener("scroll", testScroll, true)
    return () => window.removeEventListener("scroll", testScroll)
  }, [testRef])

  useLayoutEffect(() => {
    setTrimHeader(false)
  }, [getToken(), props.match.params.id])

  const buildItems = () => {
    return (
      saveAlbums &&
      saveAlbums.map((item, index) => {
        return (
          <div class="column is-2 album__item" key={index}>
            <div
              class="album__item__image__wrapper"
              onClick={() => {
                history.push(`/album/${item.album.id}`)
              }}
            >
              <img
                class="album__item__image"
                src={item && item.album.images[1].url}
                alt=""
              />
              <div class="album__item__play__button">
                <a
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.stopPropagation()
                    playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      "",
                      "",
                      item.album.uri
                    )
                  }}
                >
                  {globalState &&
                  globalState.track &&
                  globalState.track.album &&
                  globalState.track.album.uri.includes(
                    item && item.album.uri
                  ) ? (
                    <button class="button">
                      <FontAwesomeIcon icon={faPause} />
                    </button>
                  ) : (
                    <button class="button">
                      <FontAwesomeIcon icon={faPlay} />
                    </button>
                  )}
                </a>
              </div>
            </div>
            <div class="album__item__description">
              <span class="album__item__title has-text-black">
                {item && item.album.name}
              </span>
              <span class="album__item__subtitle">
                {item && item.album.artists[0].name}
              </span>
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
                  Albums
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <hr class="mt-0" />
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
                <strong class="summary__text--title title is-4">Albums</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="main__wrap">
        <div className="columns is-multiline" ref={testRef}>
          {buildItems()}
        </div>
        <p className="mt-2 mb-2 has-text-centered" style={{ width: `${100}%` }}>
          <button
            className="button is-light is-outlined has-text-grey"
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
