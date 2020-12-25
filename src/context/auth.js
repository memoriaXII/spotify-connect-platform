/** @format */

import React, { useState, useEffect, useCallback } from "react"
import { createContext, useContext } from "react"
import queryString from "query-string"
import { useHistory, useLocation } from "react-router-dom"

export const AuthContext = createContext({})

export const AuthProvider = (props) => {
  const [token, setToken] = useState(false)
  const [tokenExpirationDate, setTokenExpirationDate] = useState()
  const location = useLocation()
  const history = useHistory()
  const [authToken, setAuthToken] = useState("")
  let logoutTimer
  const login = useCallback((token, expirationTime) => {
    setToken(token)
  }, [])

  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window
    return (
      windowSetting &&
      windowSetting.localStorage &&
      JSON.parse(localStorage.getItem("spotifyAuthToken")) &&
      JSON.parse(localStorage.getItem("spotifyAuthToken")).token
    )
  }

  useEffect(() => {
    let parsed = queryString.parse(window.location.search)
    const token = parsed.access_token
    if (token && parsed.expires_in) {
      const expiration = new Date(
        new Date().getTime() + 1000 * parsed.expires_in
      )
      if (token && expiration) {
        setAuthToken(token)
        setTokenExpirationDate(expiration)
        localStorage.setItem(
          "spotifyAuthToken",
          JSON.stringify({
            token,
            expirationTime: expiration.toISOString(),
          })
        )
        history.push(`/`)
      } else if (getToken()) {
        setAuthToken(getToken())
      }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem("spotifyAuthToken")
    history.push(`/login`)
  }, [])

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
      logoutTimer = setTimeout(logout, remainingTime)
    } else {
      clearTimeout(logoutTimer)
    }
  }, [token, logout, tokenExpirationDate])

  useEffect(() => {
    const spotifyAuthTokenData = JSON.parse(
      localStorage.getItem("spotifyAuthToken")
    )
    if (
      spotifyAuthTokenData &&
      spotifyAuthTokenData.token &&
      new Date(spotifyAuthTokenData.expirationTime) > new Date()
    ) {
      login(
        spotifyAuthTokenData.token,
        new Date(spotifyAuthTokenData.expirationTime)
      )
    } else {
      localStorage.removeItem("spotifyAuthToken")
      history.push(`/login`)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        getToken,
        isLoggedIn: !!token,
      }}
    >
      <>{props.children}</>
    </AuthContext.Provider>
  )
}
