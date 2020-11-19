import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import AlbumContainer from "../../AlbumContainer"
import PlaylistContainer from "../../PlaylistContainer"
import ArtistContainer from "../../ArtistContainer"
import CategoriesContainer from "../../CategoriesContainer"
import TopTracksContainer from "../../TopTracksContainer"
import RecentPlayedContainer from "../../RecentPlayedContainer"
import AdvertismentContainer from "../../AdvertismentContainer"
import ChartsContainer from "../../ChartsContainer"

export default (props) => {
  const {
    newReleaseData,
    globalState,
    playFn,
    authToken,
    featuredPlaylistsData,
    top50TracksList,
    userTopTracksListData,
    userTopArtistListData,
    viral50TracksList,
    userRecommendListData,
  } = props
  return (
    <div>
      <div class="ad__header mt-3">
        <h2 class="ad__headline title is-4 has-text-black">Browse</h2>
      </div>
      <hr class="mt-3" />
      <div class="app-omg mb-5">
        <ul class="gs">
          {userRecommendListData.map((item, index) => {
            return (
              <li class="item">
                <div class="content">
                  <p class="subtitle is-7" style={{ color: "#5500ff" }}>
                    ALBUMS
                  </p>
                  <p
                    class="title is-6 has-text-black mt-1 mb-0 truncate"
                    style={{ width: 270 }}
                  >
                    {item.name}
                    <br />
                    {item.artists.map((i, index) => {
                      return (
                        <span class="subtitle is-7 has-text-grey">
                          by {i.name}
                        </span>
                      )
                    })}
                  </p>
                </div>

                <div class="columns is-variable is-0 m-0">
                  <div
                    class="column is-12 m-0"
                    style={{
                      backgroundImage: `url(${item.album.images[0].url})`,
                      backgroundPosition: "center center",
                      backgroundSize: "cover",
                      width: `${100}%`,
                      height: 250,
                      backgroundRepeat: "no-repeat",
                      borderRadius: 5,
                      boxShadow: `${0} ${10}px ${10}px ${0}px rgba(197, 196, 196, 0.3)`,
                      cursor: "pointer",
                    }}
                  ></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <AlbumContainer newReleaseData={newReleaseData} />
      <RecentPlayedContainer
        globalState={globalState}
        playFn={playFn}
        authToken={authToken}
      />

      <hr class="mt-0" style={{ border: "grey" }} />
      <PlaylistContainer featuredPlaylistsData={featuredPlaylistsData} />

      <div class="is-hidden-touch">
        <ChartsContainer
          viral50TracksList={viral50TracksList}
          top50TracksList={top50TracksList}
        />
      </div>
      <hr class="mt-0" style={{ border: "grey" }} />
      <TopTracksContainer userTopTracksListData={userTopTracksListData} />

      <hr class="mt-0" style={{ border: "grey" }} />
      <ArtistContainer
        globalState={globalState}
        playFn={playFn}
        authToken={authToken}
        userTopArtistListData={userTopArtistListData}
      />
    </div>
  )
}
