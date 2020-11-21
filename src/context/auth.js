/** @format */

import React, { useState, useEffect } from "react"
import { createContext, useContext } from "react"

export const AuthContext = createContext({})

export const AuthProvider = (props) => {
  const getToken = () => {
    const windowSetting = typeof window !== "undefined" && window
    return (
      windowSetting &&
      windowSetting.localStorage &&
      localStorage.getItem("spotifyAuthToken")
    )
  }

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
