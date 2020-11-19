/** @format */

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react"
import { getCategories, getPlayingHistory } from "../apis/playlist"
import axios from "axios"

export const PlaylistContext = createContext({})

export const PlaylistProvider = (props) => {
  const [categoriesData, setCategoriesData] = useState([])
  const [userPlayedTracksListData, setUserPlayedTracksListData] = useState([])
  //   const getUserCategories = async () => {
  //     try {
  //       const response = await getCategories()
  //       return response
  //     } catch (e) {
  //       return e.response
  //     }
  //   }

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
        console.log(data.categories.items, "omgdata")
        setCategoriesData(data.categories.items)
        return data.categories.items
      } catch (e) {
        console.log("e: ", e)
      }
    },
    [categoriesData]
  )

  //   useEffect(() => {
  //     if (localStorage.getItem("refreshTokenTimer")) {
  //       updateTokenTimer()
  //     }
  //   }, [])

  useEffect(() => {
    getUserCategories()
    getUserPlayingHistory()
  }, [])
  return (
    <PlaylistContext.Provider
      value={{
        userPlayedTracksListData,
        categoriesData,
      }}
    >
      <>{props.children}</>
    </PlaylistContext.Provider>
  )
}
