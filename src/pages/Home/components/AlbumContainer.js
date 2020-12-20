import React, { useRef, useState, useEffect, useContext, memo } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

import { Link, BrowserRouter, useHistory } from "react-router-dom"

import { PlaylistContext } from "../../../context/playlist"
import { PlayerContext } from "../../../context/player"
import { AuthContext } from "../../../context/auth"
import LazyLoad from "react-lazy-load"
import { getSingleAlbumTracks } from "../../../apis/playlist"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const AlbumContainer = (props) => {
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { newReleaseData } = useContext(PlaylistContext)
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

  const buildItems = () => {
    return (
      newReleaseData &&
      newReleaseData.map((item, index) => {
        return (
          <li class="hs__item" key={index}>
            <div
              class="hs__item__image__wrapper"
              onClick={() => {
                history.push(`/album/${item.id}`)
              }}
            >
              <LazyLoad debounce={false} offsetVertical={500}>
                <img
                  class="hs__item__image"
                  src={item && item.images[1].url}
                  alt=""
                />
              </LazyLoad>
            </div>
            <div class="hs__item__description">
              <span class="hs__item__title has-text-black">
                {item && item.name}
              </span>
              <span class="hs__item__subtitle">
                {item && item.artists[0].name}
              </span>
            </div>
            <div class="hs__item__play__button">
              <a href="javascript:void(0)">
                {globalState &&
                globalState.isPlaying &&
                globalState.track &&
                globalState.track.album &&
                globalState.track.album.uri.includes(item && item.uri) ? (
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
                    class="button is-cursor"
                    onClick={(e) => {
                      e.stopPropagation()
                      playFn(
                        getToken(),
                        globalState.currentDeviceId,
                        "",
                        "",
                        item.uri
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
    if (container && container.curren) {
      checkForOverflow()
      checkForScrollPosition()

      container.current.addEventListener(
        "scroll",
        debounceCheckForScrollPosition
      )
      return (
        () =>
          container.current.removeEventListener(
            "scroll",
            debounceCheckForScrollPosition
          ),
        debounceCheckForOverflow.cancel()
      )
    }
  }, [])
  const prevState = usePrevious(newReleaseData)

  useEffect(() => {
    if (undefined !== prevState && newReleaseData && newReleaseData.length) {
      if (prevState.length !== newReleaseData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, newReleaseData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline has-text-black">
          {isArtistAlbum ? (
            <>
              <p class="title is-5 mt-4">Albums</p>
            </>
          ) : (
            <div class="title is-5">New Release</div>
          )}
        </h2>
        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default memo(AlbumContainer)
