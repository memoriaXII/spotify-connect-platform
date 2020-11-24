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
        <h2 class="ad__headline title is-4 has-text-black">Home</h2>
      </div>
      <hr class="mt-3" />
      <div class="mb-5">
        <Slider {...settings}>
          {userRecommendListData &&
            userRecommendListData.map((item, index) => {
              return (
                <div key={index}>
                  <div class="content mb-4">
                    <p
                      class="title is-6 truncate mb-1"
                      style={{ width: 270, fontSize: 15 }}
                    >
                      <span style={{ color: "#0088FF", fontSize: 10 }}>
                        NEW SINGLE
                      </span>
                      <br />
                      <span class="title is-6">{item.name}</span>
                    </p>
                    <p class="title is-7 mt-0 truncate">
                      {item.artists.map((i, index) => {
                        return (
                          <span class="title is-6 has-text-grey">{i.name}</span>
                        )
                      })}
                    </p>
                  </div>

                  <div class="columns is-variable is-0 m-0 mt-0">
                    <div
                      class="column is-12 m-0 recommend-section"
                      style={{
                        backgroundImage: `url(${item.album.images[0].url})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        width: `${100}%`,
                        height: 250,
                        backgroundRepeat: "no-repeat",
                        borderRadius: 5,
                        boxShadow: `${0} ${10}px ${10}px ${0}px rgba(197, 196, 196, 0.1)`,
                        cursor: "pointer",
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
        </Slider>
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
