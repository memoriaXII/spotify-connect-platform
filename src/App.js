import "./App.scss"
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
  lazy,
  Suspense,
} from "react"

import { Helmet } from "react-helmet"

import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom"
import axios from "axios"
import Cookies from "js-cookie"

import { millisToMinutesAndSeconds, rgbToHex } from "./utils/utils"

import memoize from "memoize-one"
import queryString from "query-string"

import PrivateRoute from "./routes/PrivateRoute"

import { AuthProvider } from "./context/auth"
import { PlaylistProvider } from "./context/playlist"
import { PlayerProvider } from "./context/player"
import { ProfileProvider } from "./context/profile"
import { PodCastProvider } from "./context/podcast"

import { useScrollPosition } from "@n8tb1t/use-scroll-position"

import closeIcon from "./images/close.svg"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Search = lazy(() => import("./pages/Search"))
const Broadcast = lazy(() => import("./pages/Broadcast"))
const SearchDetail = lazy(() => import("./pages/SearchDetail"))
const ShowDetail = lazy(() => import("./pages/ShowDetail"))
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail"))
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"))
const AlbumDetail = lazy(() => import("./pages/AlbumDetail"))
const UserSaveTracks = lazy(() => import("./pages//Collection/Tracks"))
const UserSaveAlbums = lazy(() => import("./pages//Collection/Albums"))
const UserSaveArtists = lazy(() => import("./pages//Collection/Artists"))
const UserPlayedTracks = lazy(() => import("./pages/Collection/RecentPlayed"))

const PlayerControl = lazy(() => import("./components/PlayerControl"))
const SideMenu = lazy(() => import("./components/SideMenu"))
const SideChildMenu = lazy(() => import("./components/SideChildMenu"))
const Topbar = lazy(() => import("./components/Topbar"))

function App() {
  const location = useLocation()
  const scrollContainer = useRef(null)
  const sectionRef = useRef(null)
  const [gradientNum, setGradientNum] = useState(null)
  const [trimHeader, setTrimHeader] = useState(false)
  const [clientHeight, setClientHeight] = useState(0)
  const [hintModal, setHintModal] = useState(false)

  const handleScroll = () => {
    if (
      window &&
      scrollContainer &&
      scrollContainer.current &&
      scrollContainer.current.scrollTop
    ) {
      const init = 306
      const nowTop =
        init -
        (scrollContainer &&
          scrollContainer.current &&
          scrollContainer.current.scrollTop * 1.2)
      setGradientNum(nowTop)

      if (nowTop < 35 && nowTop !== null) {
        setTrimHeader(true)
        setGradientNum(null)
      } else {
        setTrimHeader(false)
        setGradientNum(null)
      }
    } else {
      setTrimHeader(false)
      setGradientNum(1000)
    }
  }

  useLayoutEffect(() => {
    window.addEventListener("scroll", handleScroll, true)
    return () => (
      window.removeEventListener("scroll", handleScroll), setGradientNum(null)
    )
  }, [scrollContainer])

  const routeDetection = location.pathname == `/login`
  const searchPageDetection = location.pathname.includes("search")
  const customSideMenuDetection =
    location.pathname.includes("artist") ||
    (location.pathname.includes("album") && pararm_id !== "albums")

  var pararm_id = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1
  )

  useEffect(() => {
    setHintModal(true)
  }, [])

  return (
    <div>
      <Helmet>
        <link
          rel="icon"
          href="https://image.flaticon.com/icons/png/512/8/8729.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Listening is everything" />
        <link
          rel="apple-touch-icon"
          href="https://image.flaticon.com/icons/png/512/8/8729.png"
        />
        <meta property="og:title" content="Spotify Connect" />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://spotify--connect.herokuapp.com/"
        />
        <meta property="og:description" content="Listening is everything" />
        <meta
          property="og:image"
          content="https://www.scdn.co/i/_global/open-graph-default.png"
        />
        <title>Spotify Connect</title>
      </Helmet>
      <div>
        <PodCastProvider>
          <ProfileProvider>
            <AuthProvider>
              <PlayerProvider>
                <PlaylistProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <div className="wrap">
                      <div
                        className="list-area"
                        style={{
                          height: !routeDetection
                            ? `calc(${100}vh - ${86}px)`
                            : `${100}vh`,
                        }}
                      >
                        {routeDetection ? null : (
                          <>
                            <SideMenu />
                          </>
                        )}
                        <div className="main" ref={scrollContainer}>
                          {routeDetection ? null : (
                            <>
                              {!searchPageDetection ? (
                                <div
                                  className="main__wrap top-scroll-bg"
                                  style={{
                                    background: `linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(255, 255, 255,1) ${gradientNum}%)`,
                                  }}
                                ></div>
                              ) : null}

                              <div
                                className="main__wrap summary on ml-0"
                                style={{
                                  display: trimHeader ? "block" : "none",
                                  borderBottom: !searchPageDetection
                                    ? `1px solid #eee`
                                    : `0px solid #eee`,
                                }}
                              >
                                <div className="summary__box ml-3">
                                  <div className="summary__text">
                                    <ul>
                                      <li>
                                        <strong className="summary__text--title title is-4">
                                          {location.pathname === "/"
                                            ? "Browse"
                                            : null}
                                        </strong>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div class="is-hidden-touch">
                                <Topbar />
                              </div>
                            </>
                          )}

                          <section
                            className={routeDetection ? "" : "section"}
                            ref={sectionRef}
                          >
                            <div className="hs__wrapper">
                              <Switch>
                                <Route path="/login" component={Login} />

                                <Route
                                  exact
                                  path="/"
                                  render={(props) => (
                                    <Home {...props} component={Home} />
                                  )}
                                />

                                <Route
                                  path="/search/:id"
                                  render={(props) => (
                                    <SearchDetail
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/search"
                                  render={(props) => (
                                    <Search
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  exact
                                  path="/broadcast"
                                  render={(props) => (
                                    <Broadcast
                                      {...props}
                                      component={Broadcast}
                                      gradientNum={gradientNum}
                                    />
                                  )}
                                />
                                <Route
                                  path="/playlist/:id"
                                  render={(props) => (
                                    <PlaylistDetail
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />
                                <Route
                                  path="/artist/:id"
                                  render={(props) => (
                                    <ArtistDetail
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      setGradientNum={setGradientNum}
                                      {...props}
                                    />
                                  )}
                                />
                                <Route
                                  path="/album/:id"
                                  render={(props) => (
                                    <AlbumDetail
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/collection/recent-played"
                                  render={(props) => (
                                    <UserPlayedTracks
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/collection/tracks"
                                  render={(props) => (
                                    <UserSaveTracks
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/collection/albums"
                                  render={(props) => (
                                    <UserSaveAlbums
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/collection/artists"
                                  render={(props) => (
                                    <UserSaveArtists
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />

                                <Route
                                  path="/show/:id"
                                  render={(props) => (
                                    <ShowDetail
                                      trimHeader={trimHeader}
                                      setTrimHeader={setTrimHeader}
                                      {...props}
                                    />
                                  )}
                                />
                              </Switch>
                            </div>
                          </section>
                        </div>
                        {routeDetection ||
                        location.pathname == "/collection/albums" ||
                        location.pathname ==
                          "/collection/artists" ? null : customSideMenuDetection ? (
                          <SideChildMenu />
                        ) : null}
                      </div>
                      {routeDetection ? null : (
                        <>
                          <PlayerControl />
                        </>
                      )}
                    </div>
                  </Suspense>
                </PlaylistProvider>
              </PlayerProvider>
            </AuthProvider>
          </ProfileProvider>
        </PodCastProvider>
      </div>
      {location.pathname !== "/login" ? (
        <HintModal hintModal={hintModal} setHintModal={setHintModal} />
      ) : null}
    </div>
  )
}

export default App

const HintModal = ({ children, setHintModal, hintModal }) => {
  if (!hintModal) {
    return null
  }
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div class="modal is-active has-text-centered">
      <div class="modal-background"></div>
      <div class="modal-card" style={{ width: 300 }}>
        <header
          class="modal-card-head"
          style={{ background: "white", border: 0 }}
        >
          <p class="modal-card-title"></p>
          <img
            class="icon is-cursor"
            onClick={() => {
              setHintModal(!hintModal)
            }}
            src={closeIcon}
            alt=""
          />
        </header>
        <section class="modal-card-body">
          <div class="has-text-black">
            <img
              style={{ width: 40 }}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAATlBMVEX///8AAAClpaX7+/vS0tL09PShoaGUlJTV1dX4+Pi8vLxNTU1TU1Orq6t9fX2MjIwvLy8/Pz8PDw9ZWVm+vr6urq5LS0u2trbMzMzGxsb73tvQAAACAUlEQVR4nO3dy1ICMRgFYSMMF5kRFQb0/V9US5Dt1PxJB2L1tz8kXcVlA8XTkyRJkiRJkiRJal+K2S3DJ24OwTPrFqZ0Dh54DJ9YuzB1ofO28QOrF46h88aGCteh81YNFQ6h884NFcZeh107hS/BA1t5L+03wfN+Pg9PdyoM35hmIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRZO2V3nfdFbldRn3nBz3ce/L0rLvuHli9fRb/zWcLnhMf4A3bAeYt/ZrqUb9+ftvS8hSZIkSZIkSZIkSZIkSZIkSZKkpizufYFJWTdcvKaU9qWuQsi94dvv76bey12ouMwb7q+/fYv9p0oNuTf8+4HmR9FblZR7w///K1kL789Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces8rVjg+z5HzVwrLYc5JY7HCmQ7Rvu0pemTlwnBiOLB6YVqGzvuMH1i9cBU6b23hAxXGnqVf7RRG32l20w/9GIXhT4tFP/3gRQtXsz7ob2JP0Yt5n/g3sde9JEmSJEmSpDm+AR4rFD68DEz5AAAAAElFTkSuQmCC"
              alt=""
            />
            <h1 class="title is-5 has-text-black mt-2">Full Screen Mode</h1>
            <p class="subtitle is-6 has-text-grey mt-2">
              Enable full screen mode for better experience
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot has-text-centered"
          style={{ background: "white", border: 0 }}
        >
          <button
            class="button is-fullwidth is-rounded"
            style={{ background: "#3D83FF", color: "white" }}
            onClick={() => {
              setHintModal(!hintModal)
              toggleFullScreen()
            }}
          >
            Apply
          </button>
        </footer>
      </div>
    </div>
  )
}
