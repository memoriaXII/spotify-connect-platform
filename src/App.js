import "./App.scss"
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

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

import { PlayerControlMobile } from "./components/PlayerControlMobile"
import { PlayerControl } from "./components/PlayerControl"
import { SideMenu } from "./components/SideMenu"
import { SideChildMenu } from "./components/SideChildMenu"
import { Topbar } from "./components/Topbar"
import PrivateRoute from "./routes/PrivateRoute"

import { AuthProvider } from "./context/auth"
import { PlaylistProvider } from "./context/playlist"
import { PlayerProvider } from "./context/player"
import { ProfileProvider } from "./context/profile"
import { PodCastProvider } from "./context/podcast"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Search from "./pages/Search"
import SearchDetail from "./pages/SearchDetail"

import ShowDetail from "./pages/ShowDetail"
import PlaylistDetail from "./pages/PlaylistDetail"
import ArtistDetail from "./pages/ArtistDetail"
import AlbumDetail from "./pages/AlbumDetail"
import UserSaveTracks from "./pages/Collection/Tracks"
import UserSaveAlbums from "./pages/Collection/Alubms"
import UserSaveArtists from "./pages/Collection/Artists"
import UserPlayedTracks from "./pages/Collection/RecentPlayed"
import Broadcast from "./pages/Broadcast"

import { useScrollPosition } from "@n8tb1t/use-scroll-position"

import { TweenLite, TimelineLite, Linear, Power1 } from "gsap"

function App() {
  const location = useLocation()
  const scrollContainer = useRef(null)
  const sectionRef = useRef(null)
  const [gradientNum, setGradientNum] = useState(null)
  const [trimHeader, setTrimHeader] = useState(false)
  const [clientHeight, setClientHeight] = useState(0)

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
  useScrollPosition(({ prevPos, currPos }) => {})

  return (
    <>
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
                      {routeDetection ? null : (
                        <>
                          <SideChildMenu />
                        </>
                      )}
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
    </>
  )
}

export default App

//  <PlayerControlMobile
// // cachedAlbumsArray={cachedAlbumsArray}
// // deviceHeight={deviceHeight}
// // imgRef={imgRef}
// // playerBackground={playerBackground}
// // setDeviceVolume={setDeviceVolume}
// // currentPlayingState={currentPlayingState}
// // userCurrentPlayingTrack={userCurrentPlayingTrack}
// // progressBarStyles={progressBarStyles}
// // authToken={authToken}
// // onChangeRange={handleChangeRange}
// />
