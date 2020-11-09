import React, { useRef, useState, useEffect } from "react"
import debounce from "lodash.debounce"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const AdvertismentContainer = (props) => {
  const { userRecommendListData } = props
  console.log(userRecommendListData)
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

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + " min " + (seconds < 10 ? "0" : "") + seconds + " secs"
  }

  const buildItems = () => {
    return userRecommendListData.map((item, index) => {
      return (
        <li class="ad__item" key={index}>
          <div class="ad__item__description"></div>
          <div
            class="ad__item__image"
            style={{
              zIndex: 99,
            }}
          >
            <div class="columns is-mobile is-gapless">
              <div class="column is-6">
                <img
                  class="inline__album"
                  src={`${item.album.images[0].url}`}
                  alt=""
                />
              </div>
              <div class="column is-6">
                <span class="title is-5 has-text-white">
                  {item.name}
                  <br />
                  {item.artists.map((i, index) => {
                    return <span class="subtitle is-7">by {i.name}</span>
                  })}
                </span>
                <br />
                <div class="has-text-light-grey subtitle is-7">
                  1 song
                  <span class="ml2">
                    {millisToMinutesAndSeconds(item.duration_ms)}
                  </span>
                </div>
                <button class="button is-light is-outlined is-small">
                  Play
                </button>
              </div>
            </div>
          </div>

          <div
            class="ad__item__image__wrapper"
            style={{
              backgroundImage: `url(${item.album.images[0].url})`,
            }}
          ></div>
        </li>
      )
    })
  }

  const buildControls = () => {
    const { canScrollLeft, canScrollRight } = state
    return (
      <>
        <div class="ad__arrows">
          <button
            class={
              !canScrollLeft ? "arrow arrow-prev disabled" : "arrow arrow-prev"
            }
            type="button"
            disabled={!canScrollLeft}
            onClick={() => {
              scrollContainerBy(-600)
            }}
          ></button>

          <button
            class={
              !canScrollRight ? "arrow arrow-next disabled" : "arrow arrow-next"
            }
            type="button"
            disabled={!canScrollRight}
            onClick={() => {
              scrollContainerBy(600)
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
  const prevState = usePrevious(userRecommendListData)

  useEffect(() => {
    if (undefined !== prevState && userRecommendListData.length) {
      if (prevState.length !== userRecommendListData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userRecommendListData])

  return (
    <div class="mb4">
      <div class="ad__header">
        <h2 class="ad__headline title is-5 has-text-white">Editor choice</h2>
        {buildControls()}
      </div>
      <ul className="ad item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default AdvertismentContainer
