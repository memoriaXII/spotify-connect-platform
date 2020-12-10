import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import { Link, BrowserRouter, useHistory } from "react-router-dom"
import { PlayerContext } from "../../../context/player"
import { PlaylistContext } from "../../../context/playlist"
import { AuthContext } from "../../../context/auth"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const ArtistContainer = (props) => {
  let history = useHistory()
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { userTopArtistListData } = useContext(PlaylistContext)
  const { getToken } = useContext(AuthContext)

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
    if (container && container.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        container && container.current

      setstate({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft !== scrollWidth - clientWidth,
      })
    }
    return null
  }

  const checkForOverflow = () => {
    const { scrollWidth, clientWidth } = container && container.current
    setstate({ hasOverflow: scrollWidth > clientWidth })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
  }

  const buildItems = () => {
    return (
      userTopArtistListData &&
      userTopArtistListData.map((item, index) => {
        return (
          <li
            class="hs__item"
            key={index}
            onClick={() => {
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
            </div>
            <div class="hs__item__play__artist__button">
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
  const prevState = usePrevious(userTopArtistListData)

  useEffect(() => {
    if (
      undefined !== prevState &&
      userTopArtistListData &&
      userTopArtistListData.length
    ) {
      if (prevState.length !== userTopArtistListData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, userTopArtistListData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline has-text-black">
          <div class="title is-5">Popular Artists</div>
        </h2>
        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default ArtistContainer
