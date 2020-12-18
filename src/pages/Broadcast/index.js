import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import Slider from "react-slick"
import { motion, AnimateSharedLayout } from "framer-motion"

import AlbumContainer from "./components/AlbumContainer"
import RecentPlayedContainer from "./components/RecentPlayedContainer"
import { PlaylistContext } from "../../context/playlist"

export default (props) => {
  const { userRecommendListData } = useContext(PlaylistContext)
  const customSlider = useRef()
  const {
    newReleaseData,
    globalState,
    featuredPlaylistsData,
    gradientNum,
  } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  const settings = {
    arrows: false,
    dots: false,
    speed: 500,
    infinite: false,
    autoplay: false,
    lazyLoad: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 1,
    beforeChange: (current, next) => setCurrentIndex(next),
  }

  return (
    <div>
      <div class="main__wrap summary">
        <div
          class="summary__bg"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(243, 121, 221, 0),
              rgba(28, 29, 29, 0.3)
              ),
            url("https://storage.googleapis.com/pr-newsroom-wp/1/2020/06/Spotify_GuteDeutsche_Cover_%C2%A9-Daniel-Roche%CC%81.jpg")`,
            height: 440,
          }}
        ></div>
        <div
          class="summary__img mt-6"
          style={{
            backgroundImage: `url("https://i.scdn.co/image/4913c770c1c775a2b317eb366815f097322f55f7")`,
          }}
        ></div>
        <div
          style={{
            boxShadow: "none",
            height: 320,
          }}
        ></div>

        <div class="summary__box mt-6">
          <div class="summary__text mt-5" style={{ width: 500, bottom: 0 }}>
            <ul>
              <li>
                <strong class="summary__text--title title is-7 has-text-white">
                  Podcast
                </strong>
              </li>
              <li>
                <strong class="summary__text--title title is-3 has-text-white">
                  Teaser: Gute Deutsche
                </strong>
              </li>
              <li>
                <strong class="summary__text--title title is-6 has-text-white">
                  Linda Zervakis präsentiert: Gute Deutsche
                </strong>
              </li>
              <li>
                <div class="columns mt-3">
                  <div class="column is-1">
                    <div class="pulse">
                      <span class="pulse__icon">{brodcastIcon()}</span>
                    </div>
                  </div>
                  <div class="column is-10 ml-2">
                    <button class="button is-light is-small is-rounded mt-2">
                      View Show
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="ad__header mt-6">
        <h2 class="ad__headline title is-4 has-text-black">Podcasts</h2>
      </div>
      <hr />
      <AlbumContainer globalState={globalState} />
      <RecentPlayedContainer globalState={globalState} />
      <hr class="mt-0" style={{ border: "grey" }} />
    </div>
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
      width="30"
      height="30"
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
