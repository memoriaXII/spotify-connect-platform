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

import AlbumContainer from "./components/AlbumContainer"
import PlaylistContainer from "./components/PlaylistContainer"
import TopTracksContainer from "./components/TopTracksContainer"
import RecentPlayedContainer from "./components/RecentPlayedContainer"
import ArtistContainer from "./components/ArtistContainer"
import Playlist2020 from "./components/Playlist2020"

import { PlaylistContext } from "../../context/playlist"

export default (props) => {
  const { userRecommendListData } = useContext(PlaylistContext)
  const customSlider = useRef()
  const { newReleaseData, globalState, featuredPlaylistsData } = props

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
              rgba(28, 29, 29, 0.1)
              ),
            url("https://storage.googleapis.com/pr-newsroom-wp/1/2020/04/MM-MAIN-PRESS-SHOT.jpg")`,
            height: 390,
          }}
        ></div>
        <div
          class="summary__img mb-6"
          style={{
            backgroundImage: `url("https://i.scdn.co/image/ab67616d0000b27392920063c6fd7bb2bcd83160")`,
          }}
        ></div>
        <div class="summary__box">
          <div class="summary__text mt-5" style={{ width: 200, bottom: 0 }}>
            <ul>
              <li>
                <strong class="summary__text--title title is-7 has-text-white">
                  Top track
                </strong>
              </li>
              <li>
                <strong class="summary__text--title title is-4 has-text-white">
                  F*cked Myself Up
                </strong>
              </li>
              <li>
                <strong
                  class="summary__text--title title is-6 has-text-white"
                  style={{ opacity: 0.8 }}
                >
                  merci, mercy
                </strong>
              </li>
              <li>
                <button class="button is-light is-small is-rounded mt-2">
                  View Album
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* <div class="ad__header mt-6">
        <h2 class="ad__headline title is-5 has-text-black">Browse</h2>
      </div> */}

      <hr />
      <AlbumContainer
        globalState={globalState}
        newReleaseData={newReleaseData}
      />
      <Playlist2020 globalState={globalState} />
      <hr />
      <RecentPlayedContainer globalState={globalState} />

      <hr class="mt-0" style={{ border: "grey" }} />
      <PlaylistContainer
        globalState={globalState}
        featuredPlaylistsData={featuredPlaylistsData}
      />
      <hr class="mt-0" style={{ border: "grey" }} />
      <TopTracksContainer globalState={globalState} />

      <hr class="mt-0" style={{ border: "grey" }} />
      <ArtistContainer globalState={globalState} />
    </div>
  )
}
