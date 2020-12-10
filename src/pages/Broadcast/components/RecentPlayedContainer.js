import React, { useRef, useState, useEffect, useContext } from "react"
import { Link, BrowserRouter, useHistory } from "react-router-dom"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import { PlaylistContext } from "../../../context/playlist"
import { PlayerContext } from "../../../context/player"
import { AuthContext } from "../../../context/auth"
import axios from "axios"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const RecentPlayedContainer = (props) => {
  let history = useHistory()
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { userPlayedTracksListData } = useContext(PlaylistContext)
  const { getToken } = useContext(AuthContext)
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })
  const [relatedShowList, setRelatedShowList] = useState([])

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

  const getRelatedShowList = (validateToken) => {
    const url = `https://api.spotify.com/v1/shows/?ids=5XOuEolVXN2paH626w5WV4,0GwBlCL75rI0Tce9JABoE9,1GdTMF4b8x5WTJuk66enCq,0MP5I0nVsnQbfKD8f682Ff&market=US`
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
        console.log(response, "list")
        setRelatedShowList(response.data.shows)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    getRelatedShowList(getToken())
  }, [getToken()])

  const buildItems = () => {
    return relatedShowList.map((item, index) => {
      return (
        <li class="hs__item" key={index}>
          <div
            class="hs__item__image__wrapper"
            onClick={() => {
              history.push(`/show/${item.id}`)
            }}
          >
            <img class="hs__item__image" src={item.images[0].url} alt="" />
          </div>
          <div class="hs__item__description">
            <div></div>
            <span class="hs__item__title has-text-black">{item.name}</span>
            {/* <span class="hs__item__subtitle">{item.artists[0].name}</span> */}
          </div>

          <div class="hs__item__play__button">
            <a href="javascript:void(0)">
              {globalState &&
              globalState.isPlaying &&
              globalState.track &&
              globalState.track.id == item.id ? (
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
                    playFn(getToken(), globalState.currentDeviceId, item.uri)
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
        <h2 class="hs__headline has-text-black">
          <div class="title is-5">Featured Podcasts</div>
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
