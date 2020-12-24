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
import { Route, Switch, useLocation } from "react-router-dom"
import axios from "axios"
import ProtectedPage from "./ProtectPage"

import { AuthProvider } from "./context/auth"
import { PlaylistProvider } from "./context/playlist"
import { PlayerProvider } from "./context/player"
import { ProfileProvider } from "./context/profile"
import { PodCastProvider } from "./context/podcast"
import { LoadingSpinner } from "./components/LoadingSpinner"

const FullScreenModal = lazy(() => import("./components/FullScreenModal"))
const PlayerControl = lazy(() => import("./components/PlayerControl"))
const SideMenu = lazy(() => import("./components/SideMenu"))
const SideChildMenu = lazy(() => import("./components/SideChildMenu"))
const Topbar = lazy(() => import("./components/Topbar"))
const SearchDetail = lazy(() => import("./pages/SearchDetail"))
const Search = lazy(() => import("./pages/Search"))

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
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <PodCastProvider>
              <ProfileProvider>
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

                                <ProtectedPage
                                  trimHeader={trimHeader}
                                  setTrimHeader={setTrimHeader}
                                  gradientNum={gradientNum}
                                  setGradientNum={setGradientNum}
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
                    {location.pathname !== "/login" ? (
                      <FullScreenModal
                        hintModal={hintModal}
                        setHintModal={setHintModal}
                      />
                    ) : null}
                  </PlaylistProvider>
                </PlayerProvider>
              </ProfileProvider>
            </PodCastProvider>
          </AuthProvider>
        </Suspense>
      </div>
    </div>
  )
}

export default App
