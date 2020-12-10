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
import {
  Route,
  Switch,
  useRouteMatch,
  useHistory,
  generatePath,
} from "react-router-dom"
import ColorThief from "colorthief"
import "./styles/style.scss"

export const Topbar = (props) => {
  const history = useHistory()
  const [clickedOutside, setClickedOutside] = useState(false)
  const [previewProfileHidden, setPreviewProfileHidden] = useState(false)
  const menuRef = useRef()
  const { userprofile } = useContext(ProfileContext)
  const [historyArray, setHistoryArray] = useState([])
  const searchRef = useRef()
  const [searchBackground, setSearchBackground] = useState("")

  const [searchState, setSearchState] = useState({
    albums: [],
    artists: [],
    playlists: [],
    query: "",
  })

  const { getToken } = useContext(AuthContext)
  const token = getToken()

  const onSearchItemWithDebounce = debounce((query) => {
    setSearchState({
      query: query,
    })
    history.replace("/search/" + query)
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

  const historymeetfilter = () => {
    var arr = JSON.parse(localStorage.getItem("setSearchHistory")) || []
    var filtered_arr = arr.filter((ele, index) => {
      return ele.id
    })
    setHistoryArray(filtered_arr)
  }

  useEffect(() => {
    historymeetfilter()
  }, [])

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
                  onChange={(e) => {
                    onSearchItemWithDebounce(e.target.value)
                  }}
                  onClick={() => {
                    historymeetfilter()
                    if (searchState.query !== "") {
                      history.push(`/search/${searchState.query}`)
                    } else {
                      history.push("/search")
                    }
                  }}
                  style={{ zIndex: 8 }}
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
                class="columns is-gapless "
                aria-haspopup="true"
                aria-controls="dropdown-menu4"
              >
                <div class="column is-12 mt-2" style={{ margin: "auto" }}>
                  <img
                    src={userprofile.images && userprofile.images[0].url}
                    class="avatar-small"
                  />
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
    </div>
  )
}
