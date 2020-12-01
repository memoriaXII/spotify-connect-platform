import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import listIcon from "../../images/list.svg"
import searchIcon from "../../images/search.svg"
import albumIcon from "../../images/album.svg"
import trackIcon from "../../images/musical-note.svg"
import micIcon from "../../images/mic.svg"
import clockIcon from "../../images/clock.svg"
import playOutlineIcon from "../../images/play-outline.svg"
import browseIcon from "../../images/browse.svg"
import brodcastIcon from "../../images/radio-waves.svg"
import playlistIcon from "../../images/playlist.svg"
import plusIcon from "../../images/ios-plus-outline.svg"
import downloadIcon from "../../images/download.svg"

import { Link, BrowserRouter, useHistory, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCompass,
  faDraftingCompass,
  faHeart,
  faHistory,
  faListOl,
  faMicrophone,
  faMicrophoneAlt,
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import { PlaylistContext } from "../../context/playlist"

export const SideChildMenu = (props) => {
  const { sidePlayListData } = useContext(PlaylistContext)
  let history = useHistory()

  return (
    <div>
      <div class="side is-hidden-touch">
        <div class="side__wrap side__nav">
          <ul class="nav">
            <li class="nav__list">
              <div class="columns">
                <div class="column is-2">
                  <i class="nav__icon">
                    <img src={brodcastIcon} alt="" />
                  </i>
                </div>
                <div class="column" style={{ margin: "auto" }}>
                  <p class="nav__text title">Broadcast</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="side__wrap side__contents mt-4">
          <ul class="contents">
            <li class="contents__title mb-2 has-text-black">LIBRARY</li>
            <li>
              <ul class="contents__box">
                <li class="contents__list on">
                  <div class="columns mt-2">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={clockIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">Recently Added </p>
                    </div>
                  </div>
                </li>
                <li class="contents__list on mt-1">
                  <div class="columns">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={micIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">Artist </p>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
          <ul class="contents">
            <li class="contents__title mb-2 has-text-black">PLAYLISTS</li>

            <li>
              <ul class="contents__box">
                <li class="contents__list">
                  <div class="columns mt-2">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={playlistIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">All playlist</p>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="side__wrap side__new-list">
          <div class="new-list">
            <div class="columns">
              <div class="column is-2">
                <i class="contents__list__icon">
                  <img src={plusIcon} alt="" />
                </i>
              </div>
              <div class="column" style={{ margin: "auto" }}>
                <p class="contents__list__text title is-7">Add new playlist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
