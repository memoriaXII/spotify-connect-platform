import React from "react"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter as Router, Switch, useLocation } from "react-router-dom"
import { hydrate, render } from "react-dom"

const rootElement = document.getElementById("root")
if (rootElement.hasChildNodes()) {
  hydrate(
    <Router>
      <App />
    </Router>,
    rootElement
  )
} else {
  render(
    <Router>
      <App />
    </Router>,
    rootElement
  )
}

reportWebVitals()
