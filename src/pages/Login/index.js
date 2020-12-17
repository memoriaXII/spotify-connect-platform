import React, {
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
import queryString from "query-string"
import "./styles/style.scss"
import percentIcon from "../../images/percent.png"

export default (props) => {
  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/api/login"
      : "https://quotes.vercel.app/api/login"
  }

  return (
    <div>
      <div className="login__section">
        <div className="login__section__content">
          <h1 className="title is-1 has-text-white">
            <div className="columns is-variable is-5">
              <div className="column is-4 has-text-centered">
                <p class="mb-5 columns is-variable is-0">
                  <div class="column" style={{ marginTop: 9.5 }}>
                    <img
                      width="200"
                      src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png"
                      alt=""
                    />
                  </div>
                  <div class="column has-text-left">
                    <span class="title is-3 has-text-white">Connect</span>
                  </div>
                </p>

                <div class="columns is-mobile is-multiline">
                  <div class="column is-12">
                    <button
                      class="button  has-text-white has-text-weight-bold  is-rounded is-fullwidth p-5"
                      onClick={handlelogin}
                      style={{ background: "#3D83FF", border: 0 }}
                    >
                      SIGN UP
                    </button>
                  </div>
                  <div class="column is-12">
                    <button
                      class="button is-light is-rounded has-text-weight-bold is-fullwidth p-5"
                      onClick={handlelogin}
                    >
                      LOGIN
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="column is-8 has-text-centered"
                style={{ margin: "auto" }}
              >
                <p class="has-text-left title is-1 has-text-white">
                  Get the right music, righ now
                </p>

                <p className="subtitle is-5 has-text-white has-text-weight-light mt-2 ml-1 has-text-left">
                  Listen to millions of songs for free
                </p>
              </div>
            </div>
          </h1>
        </div>
      </div>
    </div>
  )
}
