import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import { PlaylistContext } from "./context/playlist"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const RecentPlayedContainer = (props) => {
  const { playFn, globalState, authToken } = props
  const { userPlayedTracksListData } = useContext(PlaylistContext)
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
    // const hasOverflow = scrollWidth > clientWidth
    setstate({ hasOverflow: scrollWidth > clientWidth })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
  }

  // console.log(globalState.track.artists, "globalstate")

  const buildItems = () => {
    return userPlayedTracksListData.map((item, index) => {
      return (
        <li class="hs__item" key={index}>
          <div class="hs__item__image__wrapper">
            <img
              class="hs__item__image"
              src={item.track.album.images[0].url}
              alt=""
            />
          </div>
          <div class="hs__item__description mt-0">
            <div style={{ marginTop: 20 }}></div>
            <span
              class="hs__item__title has-text-black mt-0"
              style={{ fontSize: 15 }}
            >
              {item.track.name}
            </span>
            <span class="hs__item__subtitle">{item.track.artists[0].name}</span>
          </div>

          <div
            class="hs__item__play__button"
            onClick={() => {
              playFn(authToken, globalState.currentDeviceId, item.track.uri)
            }}
          >
            {globalState &&
            globalState.track &&
            globalState.track.id == item.track.id ? (
              <button class="button">
                <FontAwesomeIcon icon={faPause} />
              </button>
            ) : (
              <button class="button">
                <FontAwesomeIcon icon={faPlay} />
              </button>
            )}
          </div>
        </li>
      )
    })
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
  const prevState = usePrevious(userPlayedTracksListData)

  useEffect(() => {
    if (undefined !== prevState && userPlayedTracksListData.length) {
      if (prevState.length !== userPlayedTracksListData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userPlayedTracksListData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline title is-5 has-text-black">
          <p class="title is-7 mt-2 mb-2" style={{ color: "#5500ff" }}>
            LIBRARY
          </p>
          Recent played
        </h2>

        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default RecentPlayedContainer
