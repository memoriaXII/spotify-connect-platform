/** @format */

import React, { useState, useEffect } from "react"
import { createContext, useContext } from "react"
import queryString from "query-string"
import { useHistory, useLocation } from "react-router-dom"

export const AuthContext = createContext({})

export const AuthProvider = (props) => {
  const location = useLocation()
  const history = useHistory()
  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window
    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }

  useEffect(() => {
    if (!getToken()) {
      history.push("/login")
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        getToken,
      }}
    >
      <>{props.children}</>
    </AuthContext.Provider>
  )
}
