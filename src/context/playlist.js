/** @format */

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react"
import {
  getTracksTopList,
  getAllPlayLists,
  getCategories,
  getPlayingHistory,
  getTop50TracksList,
  getViral50TracksList,
} from "../apis/playlist"
import axios from "axios"

export const PlaylistContext = createContext({})

export const PlaylistProvider = (props) => {
  const [categoriesData, setCategoriesData] = useState([])
  const [userPlayedTracksListData, setUserPlayedTracksListData] = useState([])
  const [top50TracksList, setTop50TracksList] = useState([])
  const [viral50TracksList, setViral50TracksList] = useState([])
  const [userTopArtistListData, setUserTopArtistListData] = useState([])
  const [userTopTracksListData, setUserTopTracksListData] = useState([])
  const [sidePlayListData, setSidePlayListData] = useState([])

  const getUserAllPlayLists = async () => {
    try {
      const { data } = await getAllPlayLists()
      setSidePlayListData(data.items)
      return data.items
    } catch (e) {
      return e.response
    }
  }

  const getUserTracksTopList = async () => {
    try {
      const { data } = await getTracksTopList()
      setUserTopTracksListData(data.items)
      return data.items
    } catch (e) {
      return e.response
    }
  }

  const getInitTop50TracksList = async () => {
    try {
      const { data } = await getTop50TracksList()
      let cleanTop50TracksLisArray = data.items.filter(
        (ele, ind) =>
          ind === data.items.findIndex((elem) => elem.track.id === ele.track.id)
      )
      setTop50TracksList(cleanTop50TracksLisArray)
      return data.items
    } catch (e) {
      return e.response
    }
  }

  const getInitViral50TracksList = async () => {
    try {
      const { data } = await getViral50TracksList()
      let cleanViral50TracksLisArray = data.items.filter(
        (ele, ind) =>
          ind === data.items.findIndex((elem) => elem.track.id === ele.track.id)
      )
      setViral50TracksList(cleanViral50TracksLisArray)

      return data.items
    } catch (e) {
      return e.response
    }
  }

  const getUserPlayingHistory = useMemo(
    () => async () => {
      try {
        const { data } = await getPlayingHistory()

        let cleanArray = data.items.filter(
          (ele, ind) =>
            ind ===
            data.items.findIndex((elem) => elem.track.id === ele.track.id)
        )
        setUserPlayedTracksListData(cleanArray)
        return data.items
      } catch (e) {
        console.log("e: ", e)
      }
    },
    [userPlayedTracksListData]
  )

  const getUserCategories = useMemo(
    () => async () => {
      try {
        const { data } = await getCategories()
        setCategoriesData(data.categories.items)
        return data.categories.items
      } catch (e) {
        console.log("e: ", e)
      }
    },
    [categoriesData]
  )

  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window

    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }

  useEffect(() => {
    if (getToken()) {
      getUserTracksTopList()
      getInitViral50TracksList()
      getInitTop50TracksList()
      getUserCategories()
      getUserPlayingHistory()
      getUserAllPlayLists()
    }
  }, [getToken()])
  return (
    <PlaylistContext.Provider
      value={{
        sidePlayListData,
        userPlayedTracksListData,
        categoriesData,
        top50TracksList,
        viral50TracksList,
        userTopTracksListData,
      }}
    >
      <>{props.children}</>
    </PlaylistContext.Provider>
  )
}
