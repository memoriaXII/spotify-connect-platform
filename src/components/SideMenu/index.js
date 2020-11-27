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

export const SideMenu = (props) => {
  const { sidePlayListData } = useContext(PlaylistContext)
  let history = useHistory()

  console.log(sidePlayListData, "sideplay")

  return (
    <div>
      <div class="side is-hidden-touch">
        <div class="side__wrap side__nav">
          <ul class="nav">
            <Link to="/">
              <li class="nav__list">
                <div class="columns">
                  <div class="column is-2">
                    <i class="nav__icon">
                      <img src={playOutlineIcon} alt="" />
                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-home"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg> */}
                    </i>
                  </div>
                  <div class="column" style={{ margin: "auto" }}>
                    <p class="nav__text title">Listen now</p>
                  </div>
                </div>
              </li>
            </Link>

            <Link to="/browse">
              <li class="nav__list">
                <div class="columns">
                  <div class="column is-2">
                    <i class="nav__icon">
                      <img src={browseIcon} alt="" />
                    </i>
                  </div>
                  <div class="column" style={{ margin: "auto" }}>
                    <p class="nav__text title">Browse</p>
                  </div>
                </div>
              </li>
            </Link>

            <li class="nav__list">
              <div class="columns">
                <div class="column is-2">
                  <i class="nav__icon">
                    <img src={brodcastIcon} alt="" />
                    {/* <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      viewBox="0 0 1000 1000"
                    >
                      <g>
                        <g transform="translate(0.000000,119.000000) scale(0.100000,-0.100000)">
                          <path d="M2133.7,171.3c-204.8-147.5-557-467-778.2-720.9c-1687.5-1843.2-1671.1-4718.5,32.8-6561.7c245.8-262.1,606.2-589.8,802.8-720.9l352.2-245.8l163.8,270.3l172,270.4l-229.4,163.8C1789.6-6759,1093.3-5751.5,864-4784.8c-385,1654.7,294.9,3489.8,1646.6,4423.6C2871-115.5,2871-115.5,2748.1,122.1c-65.5,131.1-147.4,254-188.4,278.5C2526.9,417,2330.3,318.7,2133.7,171.3z" />
                          <path d="M7294.6,187.6L7122.6-82.7L7352-246.5c483.3-344.1,1138.6-1081.3,1392.6-1564.7c1015.7-1916.9,466.9-4161.5-1351.7-5521.3l-262.2-204.8l163.8-270.4l163.8-270.3l352.2,245.8C8335-7480,9014.9-6701.7,9326.2-6128.3c974.9,1835,688.1,4104.1-712.7,5619.6c-245.8,262.2-606.2,589.8-802.8,720.9L7458.5,458L7294.6,187.6z" />
                          <path d="M2797.3-1401.6c-286.7-254-516.1-573.4-720.9-999.4c-294.9-589.8-311.3-663.6-311.3-1409s16.4-819.2,311.3-1409.1c294.9-597.9,991.2-1376.1,1237-1376.1c49.2,0,155.6,114.6,237.6,262.1c139.3,245.8,139.3,262.1,0,335.8c-270.3,147.5-729.1,688.2-925.7,1089.6c-286.7,573.4-286.7,1622,0,2195.4c196.6,401.4,655.4,942.1,925.7,1089.5c139.3,73.7,139.3,90.1,0,335.8c-81.9,147.5-188.4,262.2-237.6,262.2C3256-1024.8,3026.6-1196.8,2797.3-1401.6z" />
                          <path d="M6442.6-1278.7c-147.4-254-147.4-262.1,0-344c278.6-147.5,737.3-680,942.1-1089.5c155.7-327.7,196.6-524.3,196.6-1097.7c-8.2-630.8-32.8-745.5-278.6-1212.4c-253.9-475.1-548.9-802.8-884.7-983c-114.7-65.5-114.7-98.2,24.6-335.8c81.9-139.3,196.6-253.9,245.8-253.9c245.8,0,942.1,770,1237,1376.1c294.9,589.9,311.3,663.6,311.3,1409.1s-16.4,819.2-311.3,1409c-295,606.2-991.3,1376.2-1237,1376.2C6639.3-1024.8,6524.6-1139.4,6442.6-1278.7z" />
                          <path d="M4443.8-2261.7c-393.2-114.7-892.9-655.3-1007.6-1073.1c-188.4-729.1,98.3-1490.9,720.9-1875.9c466.9-295,1261.5-278.5,1720.3,24.6c507.8,335.8,720.9,737.3,720.9,1376.3c0,630.8-213,1040.4-696.3,1359.9C5549.8-2212.6,4878-2130.7,4443.8-2261.7z M5689-3146.4c213-221.2,254-319.5,254-663.6c0-352.3-41-442.3-270.3-671.8c-229.4-229.3-319.5-270.2-671.8-270.2c-352.2,0-442.4,41-671.8,270.2c-229.4,229.4-270.3,319.5-270.3,663.6c0,426,204.8,753.7,573.4,917.5C4935.4-2769.6,5418.7-2876.1,5689-3146.4z" />
                        </g>
                      </g>
                    </svg> */}
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
                <li class="contents__list on mt-1">
                  <div class="columns">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={albumIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">Albums</p>
                    </div>
                  </div>
                </li>
                <li class="contents__list on mt-1">
                  <div class="columns">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={trackIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">Tracks</p>
                    </div>
                  </div>
                </li>
                <li class="contents__list on mt-1">
                  <div class="columns">
                    <div class="column is-2">
                      <i class="contents__list__icon">
                        <img src={downloadIcon} alt="" />
                      </i>
                    </div>
                    <div class="column" style={{ margin: "auto" }}>
                      <p class="contents__list__text title">Downloaded</p>
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
                {sidePlayListData &&
                  sidePlayListData.map((item, index) => {
                    return (
                      <li class="contents__list">
                        <div class="columns is-mobile is-gapless">
                          <div class="column is-2">
                            <i
                              class="contents__list__icon"
                              style={{ margin: "auto" }}
                            >
                              <img
                                width="18"
                                src={
                                  item &&
                                  item.images &&
                                  item.images[0] &&
                                  item.images[0].url
                                }
                                alt=""
                              />
                            </i>
                          </div>
                          <div
                            class="column is-10 mt-1 has-text-black"
                            style={{ margin: "auto", fontWeight: 300 }}
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
