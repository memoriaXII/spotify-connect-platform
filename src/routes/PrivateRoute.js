/** @format */

import React, { useEffect, useState, useContext } from "react"
import { Route, Redirect } from "react-router-dom"
import { AuthContext } from "../context/auth"

function PrivateRoute({
  component: Component,
  trimHeader,
  setTrimHeader,
  ...rest
}) {
  const { getToken } = useContext(AuthContext)

  return (
    <Route
      {...rest}
      render={(props) =>
        getToken() ? (
          <Component
            trimHeader={trimHeader}
            setTrimHeader={setTrimHeader}
            {...props}
          />
        ) : (
          <Redirect to={{ pathname: `/login` }} />
        )
      }
    />
  )
}

export default PrivateRoute
