import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import homeIcon from "../../images/home.svg"
import listIcon from "../../images/list.svg"
import searchIcon from "../../images/search.svg"
import { Link, BrowserRouter, useHistory, useParams } from "react-router-dom"

import { PlaylistContext } from "../../context/playlist"

export const SideMenu = (props) => {
  const { sidePlayListData } = useContext(PlaylistContext)
  let history = useHistory()

  return (
    <div>
      <div class="side is-hidden-touch">
        <div class="side__wrap side__nav">
          <ul class="nav">
            <Link to="/">
              <li class="nav__list">
                <i class="nav__icon">
                  <img src={homeIcon} alt="" />
                </i>
                <p class="nav__text title is-6">Home</p>
              </li>
            </Link>

            <Link to="/browse">
              <li class="nav__list">
                <i class="nav__icon far fa-compass">
                  <img src={listIcon} alt="" />
                </i>
                <p class="nav__text title is-6">Browse</p>
              </li>
            </Link>

            <li class="nav__list">
              <i class="nav__icon fas fa-broadcast-tower">
                <img src={searchIcon} alt="" />
              </i>
              <p class="nav__text title is-6">Radio</p>
            </li>
          </ul>
        </div>
        <div class="side__wrap side__contents">
          <ul class="contents">
            <li class="contents__title mb-2">YOUR LIBRARY</li>
            <li>
              <ul class="contents__box">
                <li class="contents__list on">Made For You</li>
              </ul>
            </li>
          </ul>
          <ul class="contents">
            <li class="contents__title mb-2">PLAYLISTS</li>
            <li>
              <ul class="contents__box">
                {sidePlayListData &&
                  sidePlayListData.map((item, index) => {
                    return (
                      <li class="contents__list">
                        <div class="columns is-mobile is-gapless">
                          <div
                            class="column is-12 mt-1"
                            style={{ margin: "auto" }}
                          >
                            <span>{item.name}</span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </li>
          </ul>
        </div>
        <div class="side__wrap side__new-list">
          <div class="new-list">
            {/* <i class="new-list__icon far fa-times-circle has-text-grey-light icon is-small">
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </i> */}
            <p class="new-list__text">New Playlist</p>
          </div>
        </div>
      </div>
    </div>
  )
}
