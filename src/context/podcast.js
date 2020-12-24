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
import { AuthContext } from "../context/auth"

export const PodCastContext = createContext({})

export const PodCastProvider = (props) => {
  const { getToken, isLoggedIn } = useContext(AuthContext)
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
