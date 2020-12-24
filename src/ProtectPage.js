import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  lazy,
  Suspense,
} from "react"
import { Helmet } from "react-helmet"
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom"
import axios from "axios"
import { AuthContext } from "./context/auth"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const SearchDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/SearchDetail")))
  })
})
const Search = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Search")))
  })
})
const Broadcast = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Broadcast")))
  })
})

const ShowDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/ShowDetail")))
  })
})

const PlaylistDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/PlaylistDetail")))
  })
})

const ArtistDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/ArtistDetail")))
  })
})

const AlbumDetail = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/AlbumDetail")))
  })
})

const UserSaveTracks = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Tracks")))
  })
})

const UserSaveAlbums = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Albums")))
  })
})

const UserSaveArtists = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/Artists")))
  })
})

const UserPlayedTracks = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./pages/Collection/RecentPlayed")))
  })
})

export default function ProtectedPage(props) {
  const { trimHeader, setTrimHeader, gradientNum, setGradientNum } = props
  const { isLoggedIn } = useContext(AuthContext)
  return isLoggedIn ? (
    <>
      <Route
        exact
        path="/"
        render={(props) => <Home {...props} component={Home} />}
      />

      <Route
        exact
        path="/broadcast"
        render={(props) => (
          <Broadcast
            {...props}
            component={Broadcast}
            gradientNum={gradientNum}
          />
        )}
      />
      <Route
        path="/playlist/:id"
        render={(props) => (
          <PlaylistDetail
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />
      <Route
        path="/artist/:id"
        render={(props) => (
          <ArtistDetail
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            setGradientNum={setGradientNum}
            {...props}
          />
        )}
      />
      <Route
        path="/album/:id"
        render={(props) => (
          <AlbumDetail
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />

      <Route
        path="/collection/recent-played"
        render={(props) => (
          <UserPlayedTracks
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />

      <Route
        path="/collection/tracks"
        render={(props) => (
          <UserSaveTracks
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />

      <Route
        path="/collection/albums"
        render={(props) => (
          <UserSaveAlbums
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />

      <Route
        path="/collection/artists"
        render={(props) => (
          <UserSaveArtists
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />

      <Route
        path="/show/:id"
        render={(props) => (
          <ShowDetail
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        )}
      />
      <Route path="/login" component={Login} />
    </>
  ) : (
    <Route path="/login" component={Login} />
  )
}
