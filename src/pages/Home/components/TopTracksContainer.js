import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"

import { Link, BrowserRouter, useHistory } from "react-router-dom"

import { PlaylistContext } from "../../../context/playlist"
import { PlayerContext } from "../../../context/player"
import { AuthContext } from "../../../context/auth"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const TopTracksContainer = (props) => {
  const { userTopTracksListData } = useContext(PlaylistContext)
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  let history = useHistory()
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
      userTopTracksListData &&
      userTopTracksListData.map((item, index) => {
        return (
          <li class="hs__item" key={index}>
            <div
              class="hs__item__image__wrapper"
              onClick={() => {
                history.push(`/album/${item.album.id}`)
              }}
            >
              <img
                class="hs__item__image"
                src={item && item.album.images && item.album.images[0].url}
                alt=""
              />
            </div>
            <div class="hs__item__description">
              <span class="hs__item__title has-text-black">{item.name}</span>
              <span class="hs__item__subtitle">{item.artists[0].name}</span>
            </div>

            <div class="hs__item__play__button">
              <a href="javascript:void(0)">
                {globalState &&
                globalState.isPlaying &&
                globalState.track.album &&
                globalState.track.album.id == item.album.id ? (
                  <button
                    class="button"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await pauseFn(getToken())
                    }}
                  >
                    <FontAwesomeIcon icon={faPause} />
                  </button>
                ) : (
                  <button
                    class="button"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await playFn(
                        getToken(),
                        globalState.currentDeviceId,
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
  const prevState = usePrevious(userTopTracksListData)

  useEffect(() => {
    if (
      userTopTracksListData &&
      undefined !== prevState &&
      userTopTracksListData.length
    ) {
      if (prevState.length !== userTopTracksListData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userTopTracksListData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline  has-text-black">
          <div class="title is-5">Jump Back in</div>
        </h2>
        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default TopTracksContainer
