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
import { Topbar } from "./components/Topbar"

import { AuthProvider } from "./context/auth"
import { PlaylistProvider } from "./context/playlist"
import { PlayerProvider } from "./context/player"
import { ProfileProvider } from "./context/profile"

import Home from "./pages/Home"

import PlaylistDetail from "./pages/PlaylistDetail"
import ArtistDetail from "./pages/ArtistDetail"
import AlbumDetail from "./pages/AlbumDetail"

import logoIcon from "./images/logo.svg"

function App() {
  const location = useLocation()
  const scrollContainer = useRef(null)
  const [gradientNum, setGradientNum] = useState(null)
  const [trimHeader, setTrimHeader] = useState(false)
  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }

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
      setGradientNum(null)
    }
  }

  useLayoutEffect(() => {
    window.addEventListener("scroll", handleScroll, true)
    return () => (
      window.removeEventListener("scroll", handleScroll), setGradientNum(null)
    )
  }, [scrollContainer])
  return (
    <>
      <div>
        <ProfileProvider>
          <AuthProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <div className="wrap">
                  {"" ? (
                    <div className="login__section">
                      {/* <div className="login__section__content">
                        <h1 className="title is-1 has-text-white">
                          <div className="columns is-gapless">
                            <div className="column is-2">
                              <span
                                className="icon is-large"
                                style={{ width: 120 }}
                              >
                                <img src={logoIcon} alt="" />
                              </span>
                            </div>
                            <div
                              className="column is-10"
                              style={{ margin: "auto" }}
                            >
                              Spotify Connect
                              <p className="title is-5 has-text-white mt-2 ml-1">
                                Continue to play and hear half of the music
                                seamlessly.
                              </p>
                              <div className="buttons">
                                <button
                                  className="button is-rounded is-outlined has-text-weight-bold"
                                  onClick={handlelogin}
                                >
                                  LOGIN
                                </button>
                                <button className="button is-black is-rounded has-text-weight-bold">
                                  SIGNUP
                                </button>
                              </div>
                            </div>
                          </div>
                        </h1>
                      </div> */}
                    </div>
                  ) : (
                    <>
                      <div className="list-area">
                        <SideMenu />
                        <div className="main" ref={scrollContainer}>
                          <div
                            className="main__wrap top-scroll-bg"
                            style={{
                              display: trimHeader ? "block" : "none",
                              background: trimHeader ? "white" : "white",
                              zIndex: 3,
                            }}
                            // style={{
                            //   background: `linear-gradient(to bottom,  rgba(0,0,0,0) 0%, rgb(255, 255, 255) ${gradientNum}%)`,
                            // }}
                          ></div>
                          <div
                            className="main__wrap summary on ml-0"
                            style={{
                              display: trimHeader ? "block" : "none",
                              borderBottom: `1px solid #eee`,
                            }}
                          >
                            <div className="summary__box ml-0">
                              <div className="summary__text ml-0">
                                <ul>
                                  <li>
                                    <strong className="summary__text--title title is-4">
                                      {location.pathname === "/"
                                        ? "Home"
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

                          <section className="section">
                            <div className="hs__wrapper">
                              <Switch>
                                <Route
                                  exact
                                  path="/"
                                  render={(props) => (
                                    <Home {...props} component={Home} />
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
                              </Switch>
                            </div>
                          </section>
                        </div>
                      </div>
                      <PlayerControl />
                    </>
                  )}
                </div>
              </PlaylistProvider>
            </PlayerProvider>
          </AuthProvider>
        </ProfileProvider>
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
