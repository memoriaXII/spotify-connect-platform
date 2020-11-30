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
import ChartsContainer from "./components/ChartsContainer"
import ArtistContainer from "./components/ArtistContainer"
import CarouselContainer from "./components/CarouselContainer"

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
      <div class="ad__header mt-3">
        <h2 class="ad__headline title is-4 has-text-black">Browse</h2>
      </div>
      <hr class="mt-3" />
      <div class="mb-5">
        <CarouselContainer />
      </div>
      <hr />
      <AlbumContainer
        globalState={globalState}
        newReleaseData={newReleaseData}
      />
      <RecentPlayedContainer globalState={globalState} />

      <hr class="mt-0" style={{ border: "grey" }} />
      <PlaylistContainer
        globalState={globalState}
        featuredPlaylistsData={featuredPlaylistsData}
      />

      <div class="is-hidden-touch">
        <ChartsContainer />
      </div>
      <hr class="mt-0" style={{ border: "grey" }} />
      <TopTracksContainer globalState={globalState} />

      <hr class="mt-0" style={{ border: "grey" }} />
      <ArtistContainer globalState={globalState} />
    </div>
  )
}
