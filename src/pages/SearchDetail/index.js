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
import ColorThief from "colorthief"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"

import { PlaylistContext } from "../../context/playlist"
import { PlayerContext } from "../../context/player"
import { AuthContext } from "../../context/auth"
import "./styles/style.scss"

export default (props) => {
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  const history = useHistory()
  let location = useLocation()
  const [searchState, setSearchState] = useState({
    albums: [],
    artists: [],
    playlists: [],
    shows: [],
  })
  const searchRef = useRef()
  const [searches, setSearches] = useState([])
  const [searchBackground, setSearchBackground] = useState("")
  const initiateGetResult = async (query) => {
    try {
      const API_URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(
        query
      )}&type=album,playlist,artist,show`
      const result = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      console.log(result.data, "dat")
      setSearchState({
        albums: result.data.albums.items,
        artists: result.data.artists.items,
        playlists: result.data.playlists.items,
        shows: result.data.shows.items,
      })

      return
    } catch (error) {
      console.log("error", error)
    }
  }

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

  const handleClick = (query) => {
    setSearches((searches) => searches.concat(query))
    setHistory(query)
  }

  function setHistory(item) {
    var recentSearch = item
    var recentSearchHistory =
      JSON.parse(localStorage.getItem("setSearchHistory")) || []
    recentSearchHistory.length = Math.min(recentSearchHistory.length, 12)
    recentSearchHistory.unshift(recentSearch)
    localStorage.setItem(
      "setSearchHistory",
      JSON.stringify(recentSearchHistory)
    )
  }

  useEffect(() => {
    if (getToken()) {
      var pararm_id = location.pathname.substring(
        location.pathname.lastIndexOf("/") + 1
      )
      initiateGetResult(pararm_id)
    }
  }, [getToken(), location.pathname])

  useEffect(() => {
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    if (
      searchState &&
      searchState.artists &&
      searchState.artists[0] &&
      searchState.artists[0].images
    ) {
      const colorThief = new ColorThief()
      const img = searchRef.current
      img.onload = () => {
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        setSearchBackground(rgbToHex(result[0], result[1], result[2]))
      }
      const rgbToHex = (r, g, b) =>
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16)
            return hex.length === 1 ? "0" + hex : hex
          })
          .join("")
    } else {
      setSearchBackground(rgbToHex(61, 131, 255))
    }
  }, [searchState])

  return (
    <div class="search">
      {searchState ? (
        <img
          class="is-hidden"
          crossOrigin={"anonymous"}
          ref={searchRef}
          alt={""}
          src={
            searchState.artists &&
            searchState.artists[0] &&
            searchState.artists[0].images &&
            searchState.artists[0].images[0] &&
            searchState.artists[0].images[0].url &&
            searchState.artists[0].images[0].url
          }
        />
      ) : null}

      {searchState.query !== "" && searchState ? (
        <div
          class="summary__bg"
          style={{
            height: 1090,
            background: `linear-gradient( to bottom ,rgba(0,0,0,0.85) 5%,${searchBackground} 80%),
            url(${
              searchState.artists &&
              searchState.artists[0] &&
              searchState.artists[0].images &&
              searchState.artists[0].images[0] &&
              searchState.artists[0].images[0].url &&
              searchState.artists[0].images[0].url
            })`,
            zIndex: 0,
            opacity: 0.99,
          }}
        ></div>
      ) : null}

      {searchState &&
      searchState.albums.length == 0 &&
      searchState &&
      searchState.artists.length == 0 &&
      searchState &&
      searchState.playlists.length == 0 ? (
        <div class="search__not_found_section">
          <h1 class="title is-5 has-text-white has-text-centered">
            No result found for
            <span class="ml-2">
              {location.pathname.substring(
                location.pathname.lastIndexOf("/") + 1
              )}
            </span>
          </h1>
          <p class="has-text-grey-light title is-7">
            Please make sure your words are spelled correctly or use less or
            different keywords
          </p>
        </div>
      ) : null}

      <div class="search__banner" style={{ zIndex: 100 }}>
        <TopResult handleClick={handleClick} searchState={searchState} />

        <div class="columns mt-5">
          {searchState && searchState.albums.length !== 0 ? (
            <div class="column is-6">
              <h1 class="title is-5 ml-5 has-text-white">Songs</h1>
              <hr style={{ opacity: 0.1 }} />
              <div class="columns search__box is-multiline is-mobile">
                {searchState &&
                  searchState.albums &&
                  searchState.albums.slice(0, 4).map((item, index) => {
                    return (
                      <div
                        class="column is-6 search__box__content"
                        key={index}
                        onClick={() => {
                          handleClick(item)
                          history.push(`/album/${item && item.id}`)
                        }}
                      >
                        <div className="columns is-mobile">
                          <div
                            class="column is-2"
                            style={{
                              width: 80,
                              height: 80,
                              backgroundImage: `url(${
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
                            <div class="search__box__content__play-btn">
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
                                globalState.track.album.uri.includes(
                                  item && item.uri
                                ) ? (
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
                          <div class="column is-8" style={{ margin: "auto" }}>
                            <div
                              className="result-title title is-6 truncate has-text-white"
                              style={{ width: 150 }}
                            >
                              {item.name}
                            </div>
                            <div
                              className="result-title subtitle is-6 has-text-grey-light  truncate"
                              style={{ width: 150 }}
                            >
                              {item.artists && item.artists[0].name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}

          {searchState && searchState.artists.length !== 0 ? (
            <div class="column is-6">
              <h1 class="title is-5 ml-5 has-text-white">Artists</h1>
              <hr style={{ opacity: 0.1 }} />
              <div class="columns search__box is-multiline is-mobile">
                {searchState &&
                  searchState.artists &&
                  searchState.artists.slice(0, 4).map((item, index) => {
                    return (
                      <div
                        class="column is-6 search__box__content"
                        key={index}
                        onClick={() => {
                          handleClick(item)
                          history.push(`/artist/${item && item.id}`)
                        }}
                      >
                        <div className="columns is-mobile">
                          <div
                            class="column is-2"
                            style={{
                              borderRadius: 50,
                              width: 80,
                              height: 80,
                              backgroundImage: `url(${
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
                            <div class="search__box__content__play-btn">
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
                                  globalState.track.artists.includes(
                                    item && item.name
                                  ) ? (
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
                          <div class="column is-8" style={{ margin: "auto" }}>
                            <div
                              className="result-title title is-6 truncate has-text-white"
                              style={{ width: 150 }}
                            >
                              {item.name}
                              <div
                                className="result-title subtitle is-6 has-text-grey-light  truncate"
                                style={{ width: 150 }}
                              >
                                {/* {item.followers.total} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}
        </div>

        <div class="columns mt-2">
          {searchState && searchState.playlists.length !== 0 ? (
            <div class="column is-6">
              <h1 class="title is-5 ml-5 has-text-white">Playlists</h1>
              <hr style={{ opacity: 0.1 }} />
              <div class="columns search__box is-multiline is-mobile">
                {searchState &&
                  searchState.playlists &&
                  searchState.playlists.slice(0, 4).map((item, index) => {
                    return (
                      <div
                        class="column is-6 search__box__content"
                        key={index}
                        onClick={() => {
                          handleClick(item)
                          history.push(`/playlist/${item && item.id}`)
                        }}
                      >
                        <div className="columns is-mobile">
                          <div
                            class="column is-2"
                            style={{
                              width: 80,
                              height: 80,
                              backgroundImage: `url(${
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
                            <div class="search__box__content__play-btn">
                              <a href="javascript:void(0)">
                                <button
                                  class="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  {globalState &&
                                  globalState.isPlaying &&
                                  globalState.contextUrl &&
                                  globalState.contextUrl.includes(
                                    item && item.uri
                                  ) ? (
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
                                    />
                                  )}
                                </button>
                              </a>
                            </div>
                          </div>
                          <div class="column is-8">
                            <div
                              className="result-title title is-6 truncate has-text-white"
                              style={{ width: 150 }}
                            >
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}
          {searchState && searchState.shows.length !== 0 ? (
            <div class="column is-6">
              <h1 class="title is-5 ml-5 has-text-white">Shows</h1>
              <hr style={{ opacity: 0.1 }} />
              <div class="columns search__box is-multiline is-mobile">
                {searchState &&
                  searchState.shows &&
                  searchState.shows.slice(0, 4).map((item, index) => {
                    return (
                      <div
                        class="column is-6 search__box__content"
                        key={index}
                        onClick={() => {
                          handleClick(item)
                          history.push(`/show/${item && item.id}`)
                        }}
                      >
                        <div className="columns is-mobile">
                          <div
                            class="column is-2"
                            style={{
                              width: 80,
                              height: 80,
                              backgroundImage: `url(${
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
                            <div class="search__box__content__play-btn">
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
                                globalState.track.album.uri.includes(
                                  item && item.uri
                                ) ? (
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
                          <div class="column is-8" style={{ margin: "auto" }}>
                            <div
                              className="result-title title is-6 truncate has-text-white"
                              style={{ width: 150 }}
                            >
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const TopResult = (props) => {
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { getToken } = useContext(AuthContext)
  const history = useHistory()
  const { searchState, handleClick } = props

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
  if (
    searchState &&
    searchState.artists &&
    searchState.artists[0] &&
    searchState.artists[0].name ==
      (searchState &&
        searchState.albums &&
        searchState.albums[0].artists &&
        searchState.albums[0].artists[0].name)
  ) {
    return (
      <div class="columns">
        <div class="column is-12">
          <div class="columns is-multiline is-mobile search__box">
            <div
              class="column is-2"
              onClick={() => {
                handleClick(searchState && searchState.artists[0])
                history.push(
                  `/artist/${searchState && searchState.artists[0].id}`
                )
              }}
            >
              <h1 class="title is-5 ml-2 has-text-white has-text-white">
                Top results
              </h1>
              <div className="columns is-mobile search__box__top-result">
                <div
                  class="column is-2"
                  style={{
                    borderRadius: `${50}%`,
                    width: 150,
                    height: 150,
                    backgroundImage: `url(${
                      searchState &&
                      searchState.artists[0] &&
                      searchState.artists[0].images &&
                      searchState.artists[0].images[0] &&
                      searchState.artists[0].images[0].url &&
                      searchState.artists[0].images[0].url
                    })`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    position: "relative",
                  }}
                >
                  <div class="search__box__top-result__play-btn">
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
                        globalState.track.artists.includes(
                          searchState &&
                            searchState.artists[0] &&
                            searchState &&
                            searchState.artists[0].name
                        ) ? (
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
                                searchState && searchState.artists[0].id
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
              </div>
            </div>
          </div>
          <div
            className="result-title title is-6 truncate has-text-white has-text-centered"
            style={{ width: 180 }}
          >
            {searchState && searchState.artists[0].name}
          </div>
          <div
            className="result-title subtitle is-6 has-text-grey  truncate has-text-centered"
            style={{ width: 180 }}
          >
            {searchState &&
              searchState.artists[0].artists &&
              searchState.artists[0].artists[0].name}
            <div class="subtitle is-6 has-text-grey-light ">Artist</div>
          </div>
        </div>
      </div>
    )
  } else if (
    searchState &&
    searchState.artists &&
    searchState.artists[0] &&
    searchState.artists[0].name
  ) {
    return (
      <div class="columns">
        <div class="column is-12">
          {/* <hr style={{ opacity: 0.1 }} /> */}

          <div class="columns is-multiline is-mobile search__box">
            <div
              class="column is-2"
              onClick={() => {
                handleClick(searchState && searchState.artists[0])
                history.push(
                  `/artist/${searchState && searchState.artists[0].id}`
                )
              }}
            >
              <h1 class="title is-5 ml-2 has-text-white has-text-white">
                Top results
              </h1>
              <div className="columns is-mobile">
                <div
                  class="column is-2"
                  style={{
                    borderRadius: `${50}%`,
                    width: 150,
                    height: 150,
                    backgroundImage: `url(${
                      searchState &&
                      searchState.artists[0] &&
                      searchState.artists[0].images &&
                      searchState.artists[0].images[0] &&
                      searchState.artists[0].images[0].url &&
                      searchState.artists[0].images[0].url
                    })`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    position: "relative",
                  }}
                >
                  <div class="search__box__top-result__play-btn">
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
                        globalState.track.artists.includes(
                          searchState &&
                            searchState.artists[0] &&
                            searchState &&
                            searchState.artists[0].name
                        ) ? (
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
                                searchState && searchState.artists[0].id
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
              </div>
            </div>
          </div>
          <div
            className="result-title title is-6 truncate has-text-white has-text-centered"
            style={{ width: 180 }}
          >
            {searchState && searchState.artists[0].name}
          </div>
          <div
            className="result-title subtitle is-6 has-text-grey  truncate has-text-centered"
            style={{ width: 180 }}
          >
            {searchState &&
              searchState.artists[0].artists &&
              searchState.artists[0].artists[0].name}
            <div class="subtitle is-6 has-text-grey-light ">Artist</div>
          </div>
        </div>
      </div>
    )
  }
  return null
}
