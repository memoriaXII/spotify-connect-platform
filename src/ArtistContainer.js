import React, { useRef, useState, useEffect } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import { Link, BrowserRouter, useHistory } from "react-router-dom"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const ArtistContainer = (props) => {
  let history = useHistory()
  const { userTopArtistListData, playFn, authToken, globalState } = props
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

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

  async function pauseFn(validateToken) {
    return fetch(`https://api.spotify.com/v1/me/player/pause`, {
      headers: {
        Authorization: `Bearer ${validateToken}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
  }

  const buildItems = () => {
    return userTopArtistListData.map((item, index) => {
      return (
        <li
          class="hs__item"
          key={index}
          onClick={() => {
            // console.log(item.id, "item")
            history.push(`/artist/${item.id}`)
          }}
        >
          <div
            class="hs__item__image__wrapper"
            style={{ borderRadius: `${50}%` }}
          >
            <img
              class="hs__item__image"
              src={item.images[0].url}
              style={{ borderRadius: `${50}%` }}
              alt=""
            />
          </div>
          <div class="hs__item__description" style={{ margin: "auto" }}>
            <div style={{ marginTop: 20 }}></div>
            <span
              class="hs__item__title has-text-black has-text-weight-bold"
              style={{ fontSize: 15 }}
            >
              {item.name}
            </span>
            {/* <span class="hs__item__subtitle">{item.user.name}</span> */}
          </div>
          <div class="hs__item__play__artist__button">
            <a
              href="javascript:void(0)"
              onClick={async (e) => {
                e.stopPropagation()
                const { tracks } = await getArtistSongs(authToken, item.id)
                playFn(authToken, globalState.currentDeviceId, "", tracks)
              }}
            >
              <button class="button">
                {globalState &&
                globalState.track &&
                globalState.track.artists &&
                globalState.track.artists.includes(item && item.name) ? (
                  <FontAwesomeIcon
                    icon={faPause}
                    onClick={(e) => {
                      e.stopPropagation()
                      pauseFn(authToken)
                    }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faPlay} />
                )}
              </button>
            </a>
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
  const prevState = usePrevious(userTopArtistListData)

  useEffect(() => {
    if (undefined !== prevState && userTopArtistListData.length) {
      if (prevState.length !== userTopArtistListData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userTopArtistListData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline title is-5 has-text-black">Popular Artists</h2>
        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default ArtistContainer
