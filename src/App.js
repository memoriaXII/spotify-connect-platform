import "./App.scss"
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
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

const FullScreenModal = lazy(() => import("./components/FullScreenModal"))
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const PlayerControl = lazy(() => import("./components/PlayerControl"))
const SideMenu = lazy(() => import("./components/SideMenu"))
const SideChildMenu = lazy(() => import("./components/SideChildMenu"))
const Topbar = lazy(() => import("./components/Topbar"))
const Search = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Search")), 100)
  })
})
const Broadcast = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Broadcast")), 100)
  })
})
const SearchDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/SearchDetail")), 100)
  })
})

const ShowDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/ShowDetail")), 100)
  })
})

const PlaylistDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/PlaylistDetail")), 100)
  })
})

const ArtistDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/ArtistDetail")), 100)
  })
})

const AlbumDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/AlbumDetail")), 100)
  })
})

const UserSaveTracks = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Tracks")), 100)
  })
})

const UserSaveAlbums = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Albums")), 100)
  })
})

const UserSaveArtists = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Artists")), 100)
  })
})

const UserPlayedTracks = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/RecentPlayed")), 100)
  })
})

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
      <Suspense
        fallback={
          <div class="has-text-centered loading-section">
            <div class="loading">
              <span class="blob1 blob"></span>
              <span class="blob2 blob"></span>
              <span class="blob3 blob"></span>
            </div>
          </div>
        }
      >
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
                  </PlaylistProvider>
                </PlayerProvider>
              </AuthProvider>
            </ProfileProvider>
          </PodCastProvider>
        </div>
        {location.pathname !== "/login" ? (
          <FullScreenModal hintModal={hintModal} setHintModal={setHintModal} />
        ) : null}
      </Suspense>
    </div>
  )
}

export default App
