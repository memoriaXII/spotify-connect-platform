import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"

import "./styles/style.scss"

export const SoundEqualizer = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="equilizer"
      viewBox="0 0 128 128"
    >
      <g>
        <rect class="bar" transform="translate(0,0)" y="15"></rect>
        <rect class="bar" transform="translate(25,0)" y="15"></rect>
        <rect class="bar" transform="translate(50,0)" y="15"></rect>
        <rect class="bar" transform="translate(75,0)" y="15"></rect>
        <rect class="bar" transform="translate(100,0)" y="15"></rect>
      </g>
    </svg>
  )
}
