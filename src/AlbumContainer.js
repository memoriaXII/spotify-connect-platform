import React, { useRef, useState, useEffect } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay } from "@fortawesome/free-solid-svg-icons"

import { Link, BrowserRouter, useHistory } from "react-router-dom"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const AlbumContainer = (props) => {
  let history = useHistory()
  const { newReleaseData, isArtistAlbum } = props
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

  const buildItems = () => {
    return newReleaseData.map((item, index) => {
      return (
        <li
          class="hs__item"
          key={index}
          onClick={() => {
            // console.log(item.id, "item")
            history.push(`/album/${item.id}`)
          }}
        >
          <div class="hs__item__image__wrapper">
            <img
              class="hs__item__image"
              src={item && item.images[1].url}
              alt=""
            />
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
            <button class="button">
              <FontAwesomeIcon icon={faPlay} />
            </button>
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
  const prevState = usePrevious(newReleaseData)

  useEffect(() => {
    if (undefined !== prevState && newReleaseData.length) {
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
            <div class="title is-5">
              <p class="title is-7 mt-2 mb-2" style={{ color: "#5500ff" }}>
                ALBUMS
              </p>
              New release
            </div>
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

export default AlbumContainer
