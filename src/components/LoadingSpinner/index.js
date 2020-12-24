import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  lazy,
  Suspense,
} from "react"

import "./styles/style.scss"

export const LoadingSpinner = () => {
  return (
    <div class="has-text-centered loading-section">
      <div class="loading">
        <span class="blob1 blob"></span>
        <span class="blob2 blob"></span>
        <span class="blob3 blob"></span>
      </div>
    </div>
  )
}
