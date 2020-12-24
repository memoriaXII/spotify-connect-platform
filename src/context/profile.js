/** @format */

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react"
import { getUserCurrentProfileFn } from "../apis/profile"
import axios from "axios"
import { AuthContext } from "./auth"

export const ProfileContext = createContext({})

export const ProfileProvider = (props) => {
  const { getToken } = useContext(AuthContext)
  const [userprofile, setUserProfile] = useState({})
  const getUserCurrentProfile = async () => {
    try {
      const { data } = await getUserCurrentProfileFn()
      setUserProfile(data)
      return data.items
    } catch (e) {
      return e.response
    }
  }

  useEffect(() => {
    if (getToken()) {
      getUserCurrentProfile()
    }
  }, [getToken()])

  return (
    <ProfileContext.Provider
      value={{
        userprofile,
      }}
    >
      <>{props.children}</>
    </ProfileContext.Provider>
  )
}
