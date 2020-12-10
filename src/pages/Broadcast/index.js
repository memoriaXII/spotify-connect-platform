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
import PlaylistContainer from "./components/PlaylistContainer"
import TopTracksContainer from "./components/TopTracksContainer"
import RecentPlayedContainer from "./components/RecentPlayedContainer"
import { PlaylistContext } from "../../context/playlist"

import { TweenLite, TimelineLite, Linear, Power1 } from "gsap"

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
      <div class="ad__header mt-3">
        <h2 class="ad__headline title is-4 has-text-black">Podcasts</h2>
      </div>
      <hr />
      <AlbumContainer globalState={globalState} />
      <RecentPlayedContainer globalState={globalState} />
      <hr class="mt-0" style={{ border: "grey" }} />
    </div>
  )
}
