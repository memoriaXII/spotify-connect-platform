import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

import { Link, BrowserRouter, useHistory } from "react-router-dom"

import { PlaylistContext } from "../../../context/playlist"
import { PlayerContext } from "../../../context/player"
import { AuthContext } from "../../../context/auth"
import { PodCastContext } from "../../../context/podcast"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const AlbumContainer = (props) => {
  const { playFn, globalState, pauseFn, testText } = useContext(PlayerContext)
  const { userPodCastData } = useContext(PodCastContext)
  const { getToken } = useContext(AuthContext)

  let history = useHistory()
  const { isArtistAlbum } = props
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const checkForScrollPosition = () => {
    const { scrollLeft, scrollWidth, clientWidth } = container.current

    setstate({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft !== scrollWidth - clientWidth,
    })
  }

  const checkForOverflow = () => {
    const { scrollWidth, clientWidth } = container.current
    setstate({ hasOverflow: scrollWidth > clientWidth })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
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
      .then(function (response) {})
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const buildItems = () => {
    return (
      userPodCastData &&
      userPodCastData.map((item, index) => {
        return (
          <li class="hs__item" key={index}>
            <div
              class="hs__item__image__wrapper"
              onClick={() => {
                history.push(`/show/${item.show.id}`)
              }}
            >
              <img
                class="hs__item__image"
                src={item && item.show.images[1].url}
                alt=""
              />
            </div>
            <div class="hs__item__description">
              <span class="hs__item__title has-text-black">
                {item && item.show.name}
              </span>
              <span class="hs__item__subtitle">
                {item && item.show.publisher}
              </span>
            </div>
            <div class="hs__item__play__button">
              <a
                href="javascript:void(0)"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {globalState &&
                globalState.isPlaying &&
                globalState.track &&
                globalState.track.showUri == item.show.uri ? (
                  <button
                    class="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      pauseFn(getToken())
                    }}
                  >
                    <FontAwesomeIcon icon={faPause} />
                  </button>
                ) : (
                  <button
                    class="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      playFn(
                        getToken(),
                        globalState.currentDeviceId,
                        "",
                        "",
                        item.show.uri
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                )}
              </a>
            </div>
          </li>
        )
      })
    )
  }

  const buildControls = () => {
    const { canScrollLeft, canScrollRight } = state
    return (
      <>
        <div class="hs__arrows">
          <button
            class={
              !canScrollLeft ? "arrow arrow-prev disabled" : "arrow arrow-prev"
            }
            type="button"
            disabled={!canScrollLeft}
            onClick={() => {
              scrollContainerBy(-200)
            }}
          ></button>

          <button
            class={
              !canScrollRight ? "arrow arrow-next disabled" : "arrow arrow-next"
            }
            type="button"
            disabled={!canScrollRight}
            onClick={() => {
              scrollContainerBy(200)
            }}
          ></button>
        </div>
      </>
    )
  }

  useEffect(() => {
    checkForOverflow()
    checkForScrollPosition()
    container.current.addEventListener("scroll", debounceCheckForScrollPosition)
    return (
      () =>
        container.current.removeEventListener(
          "scroll",
          debounceCheckForScrollPosition
        ),
      debounceCheckForOverflow.cancel()
    )
  }, [])
  const prevState = usePrevious(userPodCastData)

  useEffect(() => {
    if (undefined !== prevState && userPodCastData && userPodCastData.length) {
      if (prevState.length !== userPodCastData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userPodCastData])

  return (
    <div>
      <div class="hs__header"></div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default AlbumContainer
