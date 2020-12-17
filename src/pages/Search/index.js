import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"
import { useHistory } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import { PlaylistContext } from "../../context/playlist"
import { PlayerContext } from "../../context/player"
import { AuthContext } from "../../context/auth"
import "./styles/style.scss"

export default (props) => {
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  const history = useHistory()
  const [historyArray, setHistoryArray] = useState([])
  const [genreSeedsArray, setGenreSeedsArray] = useState([])

  const historymeetfilter = () => {
    var arr = JSON.parse(localStorage.getItem("setSearchHistory")) || []
    var filtered_arr = arr.filter((ele, index) => {
      return ele.id
    })
    const uniqueObjects = [
      ...new Map(filtered_arr.map((item) => [item.id, item])).values(),
    ]

    setHistoryArray(uniqueObjects)
  }

  const getGenreSeeds = (validateToken) => {
    const url = `https://api.spotify.com/v1/recommendations/available-genre-seeds`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setGenreSeedsArray(response.data.genres)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const removeSearchHistory = () => {
    localStorage.removeItem("setSearchHistory")
    historymeetfilter()
  }
  useEffect(() => {
    getGenreSeeds(getToken())
    historymeetfilter()
  }, [])

  return (
    <div class="recent-search">
      <div class="recent-search__banner">
        {historyArray == [] ? (
          <div class="columns">
            <div class="column is-12">
              <h1 class="title is-3 ml-5 has-text-black">Search Spotify</h1>
              <hr style={{ opacity: 0.1 }} />
            </div>
          </div>
        ) : (
          <div class="columns">
            <div class="column is-12">
              <h1 class="title is-3 ml-5 has-text-black">
                {historyArray.length !== 0 ? "Recent searches" : "Browse All"}
              </h1>
              <hr style={{ opacity: 0.9 }} />
              <div class="columns recent-search__box is-multiline is-mobile">
                {historyArray.length !== 0 ? (
                  <>
                    {historyArray.map((item, i) => (
                      <div
                        class="column is-12 recent-search__box__content pl-5 p-2"
                        key={i}
                      >
                        <RecentSearchList item={item} />
                      </div>
                    ))}
                    <button
                      class="button is-light is-rounded mt-2"
                      onClick={removeSearchHistory}
                    >
                      Clean recent search histories
                    </button>
                  </>
                ) : (
                  <>
                    {genreSeedsArray &&
                      genreSeedsArray.slice(0, 40).map((item, i) => {
                        var rand = [
                          "rgb(195, 240, 200)",
                          "rgb(160, 195, 210)",
                          "rgb(255, 100, 55)",
                          "#FFFF99",
                          "#00B3E6",
                          "#3742FA",
                          "#3366E6",
                          "#99FF99",
                          "#B34D4D",
                          "#80B300",
                          "#E6B3B3",
                          "#6680B3",
                          "#FF99E6",
                          "#CCFF1A",
                          "#FF1A66",
                          "#E6331A",
                          "#33FFCC",
                          "#B366CC",
                          "#B33300",
                          "#CC80CC",
                          "#991AFF",
                          "#E666FF",
                          "#4DB3FF",
                          "#1AB399",
                          "#00E680",
                          "#E6FF80",
                          "#1AFF33",
                          "#FF3380",
                          "#66E64D",
                          "#4D80CC",
                          "#9900B3",
                          "#E64D66",
                          "#4DB380",
                          "#99E6E6",
                          "#6666FF",
                        ]
                        return (
                          <>
                            <div
                              class="column is-2 recent-search__box__content m-2"
                              key={i}
                              style={{
                                background: rand[i],
                                height: 200,
                                position: "relative",
                                borderRadius: 10,
                              }}
                            >
                              <div
                                class="column is-2 recent-search__box__content"
                                key={i}
                                style={{
                                  background: `linear-gradient(${0}deg,transparent,rgba(0,0,0,.4))`,
                                  height: `${100}%`,
                                  position: "absolute",
                                  width: `${100}%`,
                                  left: 0,
                                  top: 0,
                                  zIndex: 0,
                                  borderRadius: 10,
                                }}
                              >
                                <span class="has-text-white title is-4 is-capitalized">
                                  {item}
                                </span>
                              </div>
                            </div>
                          </>
                        )
                      })}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const RecentSearchList = (props) => {
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  const history = useHistory()
  const { item } = props

  async function getArtistSongs(validateToken, artistId) {
    return fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=TW`,
      {
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    ).then((d) => d.json())
  }

  if (item.type == "album") {
    return (
      <div
        class="columns mt-0 mb-0 "
        onClick={() => {
          history.push(`/album/${item.id}`)
        }}
      >
        <div
          class="column is-2"
          style={{
            width: 80,
            height: 80,
            background: `url(${
              item &&
              item.images &&
              item.images[0] &&
              item.images[0].url &&
              item.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            position: "relative",
          }}
        >
          <div class="recent-search__box__content__play-btn">
            <a
              href="javascript:void(0)"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {globalState &&
              globalState.isPlaying &&
              globalState.track &&
              globalState.track.album &&
              globalState.track.album.uri.includes(item && item.uri) ? (
                <button
                  class="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    pauseFn(getToken())
                  }}
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              ) : (
                <button
                  class="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      "",
                      "",
                      item.uri
                    )
                  }}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              )}
            </a>
          </div>
        </div>

        <div class="column is-8">
          <div className="result-title title is-6">{item.name}</div>
          <div className="result-title subtitle is-6 has-text-grey">
            {item.artists && item.artists[0].name}
            <div className="result-title subtitle is-6 has-text-grey mt-9">
              Album
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type == "artist") {
    return (
      <div
        class="columns mt-0 mb-0"
        onClick={() => {
          history.push(`/artist/${item.id}`)
        }}
      >
        <div
          class="column is-2"
          style={{
            borderRadius: 50,
            width: 80,
            height: 80,
            background: `url(${
              item &&
              item.images &&
              item.images[0] &&
              item.images[0].url &&
              item.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            position: "relative",
          }}
        >
          <div class="recent-search__box__content__play-btn">
            <a href="javascript:void(0)">
              <button
                class="button"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {globalState &&
                globalState.isPlaying &&
                globalState.track &&
                globalState.track.artists &&
                globalState.track.artists.includes(item && item.name) ? (
                  <FontAwesomeIcon
                    icon={faPause}
                    onClick={(e) => {
                      e.stopPropagation()
                      pauseFn(getToken())
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faPlay}
                    onClick={async (e) => {
                      e.stopPropagation()
                      const { tracks } = await getArtistSongs(
                        getToken(),
                        item.id
                      )
                      playFn(
                        getToken(),
                        globalState.currentDeviceId,
                        "",
                        tracks
                      )
                    }}
                  />
                )}
              </button>
            </a>
          </div>
        </div>
        <div class="column is-8">
          <div className="result-title title is-6">{item.name}</div>{" "}
          <div className="result-title subtitle is-6 has-text-grey">Artist</div>
        </div>
      </div>
    )
  }

  if (item.type == "playlist") {
    return (
      <div
        class="columns mt-0 mb-0"
        onClick={() => {
          history.push(`/playlist/${item.id}`)
        }}
      >
        <div
          class="column is-2"
          style={{
            borderRadius: 50,
            width: 80,
            height: 80,
            background: `url(${
              item &&
              item.images &&
              item.images[0] &&
              item.images[0].url &&
              item.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            position: "relative",
          }}
        >
          <div class="recent-search__box__content__play-btn">
            <a
              href="javascript:void(0)"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {globalState &&
              globalState.isPlaying &&
              globalState.contextUrl &&
              globalState.contextUrl.includes(item && item.uri) ? (
                <button
                  class="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    pauseFn(getToken())
                  }}
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              ) : (
                <button
                  class="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    playFn(
                      getToken(),
                      globalState.currentDeviceId,
                      "",
                      "",
                      item.uri
                    )
                  }}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              )}
            </a>
          </div>
        </div>
        <div class="column is-8">
          <div className="result-title title is-6">{item.name}</div>
          <div className="result-title subtitle is-6 has-text-grey">
            Playlist
          </div>
        </div>
      </div>
    )
  }
  return null
}
