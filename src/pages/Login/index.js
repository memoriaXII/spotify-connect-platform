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
import { useHistory, useLocation } from "react-router-dom"
import axios from "axios"
import logoIcon from "../../images/logo.svg"
import "./styles/style.scss"
import { AuthContext } from "../../context/auth"

const useProgressiveImage = (src) => {
  const [sourceLoaded, setSourceLoaded] = useState(null)
  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setSourceLoaded(src)
  }, [src])

  return sourceLoaded
}

export default memo((props) => {
  const { isLoggedIn, getToken } = useContext(AuthContext)
  const history = useHistory()
  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/api/login"
      : "https://quotes.vercel.app/api/login"
  }

  const handleSignup = () => {
    window.location = "https://www.spotify.com/us/signup/"
  }

  useEffect(() => {
    if (isLoggedIn && getToken()) {
      history.push(`/`)
    } else {
      return
    }
  }, [isLoggedIn, getToken()])

  const loaded = useProgressiveImage(
    "https://storage.googleapis.com/pr-newsroom-wp/1/2020/02/020620_MissyElliott_Spotify_1920x733_2.jpg"
  )
  const placeholder = require("../../images/login_bg.jpg")

  return (
    <div class="login-section">
      <img
        src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png"
        alt=""
      />
      <div class="left">
        <div class="header mb-5">
          <p class="mb-2 columns is-variable is-0">
            <div class="column is-4" style={{ marginTop: 9.5 }}></div>
          </p>
          <h2 class=" has-text-black title is-3">
            Get the right music, righ now
          </h2>
          <h4 class="subtitle mt-1"> Listen to millions of songs for free</h4>
        </div>

        <button
          class="button  has-text-white has-text-weight-bold  is-rounded is-fullwidth p-5"
          onClick={handleSignup}
          style={{ background: "#3D83FF", border: 0 }}
        >
          SIGN UP
        </button>

        <button
          class="button is-light is-rounded has-text-weight-bold is-fullwidth p-5 mt-2"
          onClick={handlelogin}
        >
          LOGIN
        </button>
      </div>
      <div
        class="right"
        style={{ backgroundImage: `url(${loaded || placeholder})` }}
      ></div>
    </div>
  )
})
