import React, {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import listIcon from "../../images/list.svg"
import searchIcon from "../../images/search.svg"
import playlistIcon from "../../images/playlist.svg"
import plusIcon from "../../images/ios-plus-outline.svg"

import {
  Link,
  BrowserRouter,
  useHistory,
  useParams,
  useLocation,
} from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCompass,
  faDraftingCompass,
  faHeart,
  faHistory,
  faListOl,
  faMicrophone,
  faMicrophoneAlt,
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import { PlaylistContext } from "../../context/playlist"

import "./styles/style.scss"

import LazyLoad from "react-lazy-load"

export default memo((props) => {
  const { sidePlayListData } = useContext(PlaylistContext)
  let history = useHistory()
  let location = useLocation()

  return (
    <div>
      <div class="side is-hidden-touch">
        <div class="side__wrap side__nav">
          <img
            class="ml-2 mt-4 mr-2"
            width="120"
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png"
            alt=""
          />
          <MainNavLink />
        </div>
        <div class="side__wrap side__contents mt-4">
          <ul class="contents">
            <li class="contents__title mb-2 has-text-black">LIBRARY</li>
            <li>
              <ul class="contents__box mt-4">
                <UserNavLink />
              </ul>
            </li>
          </ul>
          <ul class="contents">
            <li class="contents__title mb-2 has-text-black">PLAYLISTS</li>

            <li>
              <ul class="contents__box">
                <li class="contents__list">
                  <div class="columns mt-2">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={playlistIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">All playlist</p>
                    </div>
                  </div>
                </li>

                {sidePlayListData &&
                  sidePlayListData.map((item, index) => {
                    return (
                      <li
                        class="contents__list"
                        key={index}
                        onClick={() => {
                          history.push(`/playlist/${item.id}`)
                        }}
                      >
                        <div class="columns is-mobile is-gapless">
                          <div class="column is-2">
                            <i
                              class="contents__list__icon"
                              style={{ margin: "auto" }}
                            >
                              <LazyLoad debounce={false} offsetVertical={500}>
                                <img
                                  width="18"
                                  src={
                                    item &&
                                    item.images &&
                                    item.images[0] &&
                                    item.images[0].url
                                  }
                                  alt=""
                                />
                              </LazyLoad>
                            </i>
                          </div>
                          <div
                            class="column is-10 mt-1 has-text-black"
                            style={{ margin: "auto" }}
                          >
                            <p
                              class="album-cover__title truncate"
                              style={{
                                fontSize: 12,
                                width: 150,
                                fontWeight: 300,
                                opacity: 0.7,
                              }}
                            >
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </li>
          </ul>
        </div>

        <div class="side__wrap side__new-list">
          <div class="new-list">
            <div class="columns">
              <div class="column is-2">
                <i class="contents__list__icon">
                  <img src={plusIcon} alt="" />
                </i>
              </div>
              <div class="column" style={{ margin: "auto" }}>
                <p class="contents__list__text title is-7">Add new playlist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

const UserNavLink = () => {
  let location = useLocation()
  const [menuState, setMenuState] = useState({
    activeLink: null,
  })

  const navLinks = [
    {
      id: 1,
      icon: clockIcon(),
      name: "Recently Played",
      to: "/collection/recent-played",
      className: "contents__list",
    },
    {
      id: 2,
      icon: micIcon(),
      name: "Artist",
      to: "/collection/artists",
      className: "contents__list ",
    },
    {
      id: 3,
      icon: albumIcon(),
      name: "Albums",
      to: "/collection/albums",
      className: "contents__list",
    },
    {
      id: 4,
      icon: trackIcon(),
      name: "Tracks",
      to: "/collection/tracks",
      className: "contents__list",
    },
  ]

  const handleClick = (id) => {
    setMenuState({
      activeLink: id,
    })
  }
  const { activeLink } = menuState

  return (
    <div>
      {navLinks &&
        navLinks.map((link, index) => {
          return (
            <>
              <Link to={link.to}>
                <li
                  key={index}
                  className={
                    link.className +
                    (link.id === activeLink && location.pathname == link.to
                      ? " on "
                      : " ")
                  }
                  key={link.id}
                  onClick={async () => {
                    await handleClick(link.id)
                  }}
                >
                  <div class="columns is-cursor">
                    <div class="column is-2">
                      <i class="contents__list__icon is-cursor">{link.icon}</i>
                    </div>
                    <div class="column is-cursor" style={{ margin: "auto" }}>
                      <p class="contents__list__text title is-cursor">
                        {link.name}
                      </p>
                    </div>
                  </div>
                </li>
              </Link>
            </>
          )
        })}
    </div>
  )
}

const MainNavLink = () => {
  let location = useLocation()
  const [state, setstate] = useState({
    activeLink: 1,
  })

  const navLinks = [
    {
      id: 1,
      icon: browseIcon(),
      name: "Browse",
      to: "/",
      className: "nav__list",
    },
    {
      id: 2,
      icon: brodcastIcon(),
      name: "Brodcast",
      to: "/broadcast",
      className: "nav__list",
    },
  ]

  const handleClick = (id) => {
    setstate({
      activeLink: id,
    })
  }
  const { activeLink } = state

  return (
    <div>
      <ul class="nav">
        {navLinks &&
          navLinks.map((link) => {
            return (
              <>
                <Link to={link.to}>
                  <li
                    className={
                      link.className +
                      (link.id === activeLink && location.pathname == link.to
                        ? " active  "
                        : "")
                    }
                    key={link.id}
                    onClick={async () => {
                      await handleClick(link.id)
                    }}
                  >
                    <div class="columns is-cursor">
                      <div class="column is-2 is-cursor">
                        <i class="nav__icon is-cursor">{link.icon}</i>
                      </div>
                      <div class="column is-cursor" style={{ margin: "auto" }}>
                        <p class="nav__text title">{link.name}</p>
                      </div>
                    </div>
                  </li>
                </Link>
              </>
            )
          })}
      </ul>
    </div>
  )
}

const playOutlineIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      fill="currentColor"
      stroke="currentColor"
      width="18"
      height="18"
      viewBox="0 0 512 512"
    >
      <g>
        <path d="M144,124.9L353.8,256L144,387.1V124.9 M128,96v320l256-160L128,96L128,96z" />
      </g>
    </svg>
  )
}

const browseIcon = () => {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M291.301 81.778l166.349 373.587-19.301 8.635-166.349-373.587zM64 463.746v-384h21.334v384h-21.334zM192 463.746v-384h21.334v384h-21.334z"
        fill="currentColor"
        width="18"
        height="18"
        stroke="currentColor"
      />
    </svg>
  )
}

const brodcastIcon = () => {
  return (
    <svg
      fill="currentColor"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="18"
      height="18"
      viewBox="0 0 512 512"
      enable-background="new 0 0 512 512"
    >
      <g>
        <circle cx="256" cy="256" r="64" />
        <g>
          <path
            d="M144,256c0-36.9,18.553-69.208,46.314-87.034l-23.141-24.512c-6.26,4.608-12.18,9.833-17.684,15.663
			C125.314,185.729,112,219.781,112,256c0,36.219,13.314,70.271,37.49,95.883c5.504,5.829,11.424,11.055,17.684,15.662
			l23.141-24.511C162.553,325.208,144,292.9,144,256z"
          />
          <path
            d="M368,256c0,36.9-18.553,69.208-46.314,87.034l23.141,24.511c6.26-4.607,12.18-9.833,17.684-15.662
			C386.686,326.271,400,292.219,400,256c0-36.219-13.314-70.271-37.49-95.882c-5.504-5.83-11.424-11.055-17.684-15.663
			l-23.141,24.512C349.447,186.792,368,219.1,368,256z"
          />
          <path
            d="M64,256c0-55.578,25.251-104.907,64.263-135.817L105.433,96c-5.999,5-11.739,10.396-17.197,16.178
			c-17.622,18.669-31.462,40.417-41.134,64.641C37.081,201.917,32,228.556,32,256c0,27.443,5.081,54.084,15.102,79.181
			c9.672,24.226,23.512,45.973,41.134,64.642c5.458,5.781,11.198,11.177,17.197,16.178l22.829-24.183
			C89.251,360.907,64,311.578,64,256z"
          />
          <path
            d="M448,256c0,55.578-25.251,104.907-64.262,135.817l22.828,23.848c6-5.001,11.74-10.062,17.198-15.843
			c17.622-18.669,31.462-40.416,41.134-64.642C474.918,310.084,480,283.443,480,256c0-27.444-5.082-54.083-15.102-79.181
			c-9.672-24.225-23.512-45.972-41.134-64.641C418.307,106.396,412.566,101,406.566,96l-22.829,24.183
			C422.749,151.093,448,200.422,448,256z"
          />
        </g>
      </g>
    </svg>
  )
}

const clockIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      fill="currentColor"
      stroke="currentColor"
      width="18"
      height="18"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208c114.9,0,208-93.1,208-208S370.9,48,256,48z M256,446.7
		c-105.1,0-190.7-85.5-190.7-190.7c0-105.1,85.5-190.7,190.7-190.7c105.1,0,190.7,85.5,190.7,190.7
		C446.7,361.1,361.1,446.7,256,446.7z"
        />
        <polygon points="256,256 160,256 160,273.3 273.3,273.3 273.3,128 256,128 	" />
      </g>
    </svg>
  )
}

const micIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      fill="currentColor"
      stroke="currentColor"
      width="18"
      height="18"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          d="M256,32c-43.7,0-79,37.5-79,83.5V270c0,46,35.3,83.5,79,83.5c43.7,0,79-37.5,79-83.5V115.5C335,69.5,299.7,32,256,32z
		 M319,270c0,37.2-28.3,67.5-63,67.5c-34.7,0-63-30.3-63-67.5V115.5c0-37.2,28.3-67.5,63-67.5c34.7,0,63,30.3,63,67.5V270z"
        />
        <path
          d="M367,192v79.7c0,60.2-49.8,109.2-110,109.2c-60.2,0-110-49-110-109.2V192h-19v79.7c0,67.2,53,122.6,120,127.5V462h-73v18
		h161v-18h-69v-62.8c66-4.9,117-60.3,117-127.5V192H367z"
        />
      </g>
    </svg>
  )
}

const albumIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      fill="currentColor"
      stroke="currentColor"
      width="18"
      height="18"
      viewBox="0 0 512 512"
    >
      <g>
        <path d="M464,144v288H48V144H464 M480,128H32v320h448V128L480,128z" />
        <rect x="72" y="96" width="368" height="16" />
        <rect x="104" y="64" width="304" height="16" />
      </g>
    </svg>
  )
}

const trackIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      fill="currentColor"
      stroke="currentColor"
      width="18"
      height="18"
      viewBox="0 0 512 512"
    >
      <path
        d="M352.1,102.3c0-0.1,0-0.2,0-0.2c-0.1-0.3-0.1-0.5-0.2-0.8c0,0,0-0.1,0-0.1c-0.6-1.5-1.8-3-3.5-3.4l-2-0.4L256,78v272.6
	c-8,0-22.4,0.4-44.5,1.3c-41.8,1.6-51.4,21.6-51.4,40.9c0,24.6,13.2,43.1,61.5,41c51.8-2.3,51.4-48.5,51.4-81.7V159.6l73.6,13.5l0,0
	c3,0.6,5.4-2.3,5.4-5.3v-64.4C352,103,352.1,102.6,352.1,102.3z"
      />
    </svg>
  )
}
