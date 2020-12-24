import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react"
import axios from "axios"
import { AuthContext } from "../context/auth"

export const SpotifyAPI = (options, baseURL) => {
  const authorizationToken = JSON.parse(
    localStorage.getItem("spotifyAuthToken")
  ).token
  const { REACT_APP_SPOTIFY_API_URL } = process.env

  return axios.create({
    baseURL: REACT_APP_SPOTIFY_API_URL,
    headers: {
      Authorization: `Bearer ${authorizationToken}`,
      "Content-Type": "application/json",
      ...options,
    },
  })
}
