/** @format */

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react"

import { getUserCurrentPodCastPlaylist } from "../apis/podcast"

import axios from "axios"

export const PodCastContext = createContext({})

export const PodCastProvider = (props) => {
  const [userPodCastData, setUserPodCastData] = useState([])

  const getCurrentPodCastPlaylist = async () => {
    try {
      const { data } = await getUserCurrentPodCastPlaylist()
      setUserPodCastData(data.items)
      return data.tracks
    } catch (e) {
      return e.response
    }
  }

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
      getCurrentPodCastPlaylist()
    }
  }, [getToken()])
  return (
    <PodCastContext.Provider
      value={{
        userPodCastData,
      }}
    >
      <>{props.children}</>
    </PodCastContext.Provider>
  )
}
