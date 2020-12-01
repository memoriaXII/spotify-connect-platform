import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"
import axios from "axios"
import { ProfileContext } from "../../context/profile"
import { AuthContext } from "../../context/auth"
import debounce from "lodash.debounce"
import { useHistory } from "react-router-dom"

export const Topbar = () => {
  const history = useHistory()
  const [clickedOutside, setClickedOutside] = useState(false)
  const [previewProfileHidden, setPreviewProfileHidden] = useState(false)
  const menuRef = useRef()
  const { userprofile } = useContext(ProfileContext)

  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }

  const [searchState, setSearchState] = useState({
    albums: [],
    artists: [],
    playlists: [],
    query: "",
  })

  const [searches, setSearches] = useState([])
  const handleClick = (query) => {
    setSearches((searches) => searches.concat(query))
  }
  const { getToken } = useContext(AuthContext)
  const token = getToken()

  const initiateGetResult = async (query) => {
    try {
      const API_URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(
        query
      )}&type=album,playlist,artist`
      const result = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSearchState({
        albums: result.data.albums.items,
        artists: result.data.artists.items,
        playlists: result.data.playlists.items,
      })

      console.log(result.data, "result")
      return
    } catch (error) {
      console.log("error", error)
    }
  }

  const onSearchItemWithDebounce = debounce((query) => {
    setSearchState({
      query: query,
    })
    initiateGetResult(query)
  }, 500)

  const handleClickOutside = (e) => {
    if (!menuRef.current.contains(e.target)) {
      setClickedOutside(true)
    }
  }

  const handleClickInside = () => setClickedOutside(false)

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  })

  useEffect(() => {
    if (clickedOutside) {
      setPreviewProfileHidden(false)
      return
    }
  }, [clickedOutside])

  return (
    <div ref={menuRef}>
      <div class="main__wrap top-bar">
        <ul class="top-bar__left top-bar__wrap">
          <li class="top-bar__search">
            <div class="field">
              <p class="control has-icons-left has-icons-right">
                <input
                  type="text"
                  class="input is-small is-rounded is-light"
                  placeholder="Search"
                  onChange={(e) => onSearchItemWithDebounce(e.target.value)}
                  onClick={() => {
                    setPreviewProfileHidden(true)
                    handleClickInside()
                  }}
                />
                <span
                  class="icon is-small is-right"
                  onClick={() => {
                    setSearchState({ query: "" })
                  }}
                >
                  <a class="delete is-small"></a>
                </span>
              </p>
            </div>
          </li>
        </ul>
        <ul class="top-bar__right top-bar__wrap">
          <div class="dropdown is-hoverable is-right">
            <div class="dropdown-trigger">
              <div
                class="columns is-gapless"
                aria-haspopup="true"
                aria-controls="dropdown-menu4"
              >
                <div class="column" style={{ margin: "auto" }}>
                  <img
                    src={userprofile.images && userprofile.images[0].url}
                    class="avatar-small"
                  />
                </div>
                <div class="column ml-2 has-text-black">
                  {userprofile.display_name}
                </div>
              </div>
            </div>
            <div
              class="dropdown-menu"
              id="dropdown-menu4"
              role="menu"
              style={{ background: "transparent", border: 0 }}
            >
              <div class="dropdown-content">
                <div class="dropdown-item">
                  <p>Signout</p>
                </div>
              </div>
            </div>
          </div>
        </ul>
      </div>
      <SearchComponent
        menuRef={menuRef}
        handleClick={handleClick}
        setPreviewProfileHidden={setPreviewProfileHidden}
        handleClickInside={handleClickInside}
        searchState={searchState}
        previewProfileHidden={previewProfileHidden}
        searches={searches}
      />
    </div>
  )
}

const SearchComponent = (props) => {
  const history = useHistory()
  const {
    handleClick,
    searches,
    searchState,
    previewProfileHidden,
    menuRef,
    handleClickInside,
    setPreviewProfileHidden,
  } = props

  const favoriteResult = () => {
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
            <h1 class="title is-5 ml-5">Popular results</h1>
            <hr />
            <div class="columns is-multiline is-mobile search__box">
              <div
                class="column is-6 search__box__content"
                onClick={() => {
                  handleClick(searchState && searchState.artists[0])
                  history.push(
                    `/artist/${searchState && searchState.artists[0].id}`
                  )
                  setPreviewProfileHidden(false)
                }}
              >
                <div className="columns is-mobile">
                  <div
                    class="column is-2"
                    style={{
                      width: 80,
                      height: 80,
                      background: `url(${
                        searchState &&
                        searchState.artists[0] &&
                        searchState.artists[0].images &&
                        searchState.artists[0].images[0] &&
                        searchState.artists[0].images[0].url &&
                        searchState.artists[0].images[0].url
                      })`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  ></div>
                  <div class="column is-8 has-text-left">
                    <div
                      className="result-title title is-6 truncate"
                      style={{ width: 150 }}
                    >
                      {searchState && searchState.artists[0].name}
                    </div>
                    <div
                      className="result-title subtitle is-6 has-text-grey  truncate"
                      style={{ width: 150 }}
                    >
                      {searchState &&
                        searchState.artists[0].artists &&
                        searchState.artists[0].artists[0].name}
                      <div class="subtitle is-6 has-text-grey">Artist</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      class="search"
      style={{ display: previewProfileHidden ? "block" : "none" }}
    >
      {searchState && searchState.query !== "" ? (
        <div class="search__banner">
          {favoriteResult()}
          <div class="columns mt-5">
            <div class="column is-6">
              <h1 class="title is-5 ml-5">Songs</h1>
              <hr />
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
                          setPreviewProfileHidden(false)
                        }}
                      >
                        <div className="columns is-mobile">
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
                            }}
                          ></div>
                          <div class="column is-8" style={{ margin: "auto" }}>
                            <div
                              className="result-title title is-6 truncate"
                              style={{ width: 150 }}
                            >
                              {item.name}
                            </div>
                            <div
                              className="result-title subtitle is-6 has-text-grey  truncate"
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
            <div class="column is-6">
              <h1 class="title is-5 ml-5">Artists</h1>
              <hr />
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
                          setPreviewProfileHidden(false)
                        }}
                      >
                        <div className="columns is-mobile">
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
                            }}
                          ></div>
                          <div class="column is-8" style={{ margin: "auto" }}>
                            <div
                              className="result-title title is-6 truncate"
                              style={{ width: 150 }}
                            >
                              {item.name}
                              <div
                                className="result-title subtitle is-6 has-text-grey  truncate"
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
          </div>
          <div class="columns mt-2">
            <div class="column is-6">
              <h1 class="title is-5 ml-5">Playlists</h1>
              <hr />
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
                          setPreviewProfileHidden(false)
                        }}
                      >
                        <div className="columns is-mobile">
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
                            }}
                          ></div>
                          <div class="column is-8">
                            <div
                              className="result-title title is-6 truncate"
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
            <div class="column is-6">
              <h1 class="title is-5 ml-5">Shows</h1>
              <hr />
              <div class="columns search__box is-multiline is-mobile"></div>
            </div>
          </div>
        </div>
      ) : (
        <div class="search__banner">
          <div class="columns">
            <div class="column is-12">
              <h1 class="title is-5 ml-5">Recent searches</h1>
              <hr />
              <div class="columns search__box is-multiline is-mobile">
                {searches.map((item, i) => (
                  <div class="column is-12 search__box__content" key={i}>
                    {filteSearchContentHistory(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{ display: previewProfileHidden ? "block" : "none" }}
        className="search__bg"
      ></div>
    </div>
  )
}

const filteSearchContentHistory = (content) => {
  if (content.type == "album") {
    return (
      <div class="columns mt-2 mb-2">
        <div
          class="column is-2"
          style={{
            width: 80,
            height: 80,
            background: `url(${
              content &&
              content.images &&
              content.images[0] &&
              content.images[0].url &&
              content.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        ></div>
        <div class="column is-8">
          <div className="result-title title is-6">{content.name}</div>
          <div className="result-title subtitle is-6 has-text-grey">
            {content.artists && content.artists[0].name}
          </div>
        </div>
      </div>
    )
  }

  if (content.type == "artist") {
    return (
      <div class="columns mt-2 mb-2">
        <div
          class="column is-2"
          style={{
            borderRadius: 50,
            width: 80,
            height: 80,
            background: `url(${
              content &&
              content.images &&
              content.images[0] &&
              content.images[0].url &&
              content.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        ></div>
        <div class="column is-8">
          <div className="result-title title is-6">{content.name}</div>
        </div>
      </div>
    )
  }

  if (content.type == "playlist") {
    return (
      <div class="columns mt-2 mb-2">
        <div
          class="column is-2"
          style={{
            borderRadius: 50,
            width: 80,
            height: 80,
            background: `url(${
              content &&
              content.images &&
              content.images[0] &&
              content.images[0].url &&
              content.images[0].url
            })`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        ></div>
        <div class="column is-8">
          <div className="result-title title is-6">{content.name}</div>
        </div>
      </div>
    )
  }
}
