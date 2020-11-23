/** @format */

import React, { useState, useEffect } from "react"
import { createContext, useContext } from "react"

export const PlayerContext = createContext({})

export const PlayerProvider = (props) => {
  const playFn = async (
    validateToken,
    id,
    uri,
    artistUris,
    contextUri,
    offset = 0
  ) => {
    const parsedValues = {
      artistSongs: artistUris && artistUris.map((x) => x.uri),
    }
    let body
    const { artistSongs } = parsedValues
    if (artistUris) {
      body = JSON.stringify({ uris: artistSongs, offset: { position: 0 } })
    }
    if (uri) {
      body = JSON.stringify({ uris: [uri], offset: { position: 0 } })
    }
    if (contextUri) {
      body = JSON.stringify({
        context_uri: contextUri,
        offset: { position: 0 },
      })
    }

    return await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${id}`,
      {
        body,
        headers: {
          Authorization: `Bearer ${validateToken}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      }
    )
  }

  return (
    <PlayerContext.Provider
      value={{
        playFn,
      }}
    >
      <>{props.children}</>
    </PlayerContext.Provider>
  )
}
