import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"
import axios from "axios"
import logoIcon from "../../images/logo.svg"

export default (props) => {
  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }
  return (
    <div>
      <div className="login__section">
        <div className="login__section__content">
          <h1 className="title is-1 has-text-white">
            <div className="columns is-gapless">
              <div className="column is-2">
                <span className="icon is-large" style={{ width: 120 }}>
                  <img src={logoIcon} alt="" />
                </span>
              </div>
              <div className="column is-10" style={{ margin: "auto" }}>
                Spotify Connect
                <p className="title is-5 has-text-white mt-2 ml-1">
                  Continue to play and hear half of the music seamlessly.
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
        </div>
      </div>
    </div>
  )
}
