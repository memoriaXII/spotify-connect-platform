import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  memo,
} from "react"
import closeIcon from "../../images/close.svg"

export default ({ children, setHintModal, hintModal }) => {
  if (!hintModal) {
    return null
  }
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div class="modal is-active has-text-centered">
      <div class="modal-background"></div>
      <div class="modal-card" style={{ width: 300 }}>
        <header
          class="modal-card-head"
          style={{ background: "white", border: 0 }}
        >
          <p class="modal-card-title"></p>
          <img
            class="icon is-cursor"
            onClick={() => {
              setHintModal(!hintModal)
            }}
            src={closeIcon}
            alt=""
          />
        </header>
        <section class="modal-card-body">
          <div class="has-text-black">
            <img
              style={{ width: 40 }}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAATlBMVEX///8AAAClpaX7+/vS0tL09PShoaGUlJTV1dX4+Pi8vLxNTU1TU1Orq6t9fX2MjIwvLy8/Pz8PDw9ZWVm+vr6urq5LS0u2trbMzMzGxsb73tvQAAACAUlEQVR4nO3dy1ICMRgFYSMMF5kRFQb0/V9US5Dt1PxJB2L1tz8kXcVlA8XTkyRJkiRJkiRJal+K2S3DJ24OwTPrFqZ0Dh54DJ9YuzB1ofO28QOrF46h88aGCteh81YNFQ6h884NFcZeh107hS/BA1t5L+03wfN+Pg9PdyoM35hmIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRbSe56F9J5nIb3nWUjveRZO2V3nfdFbldRn3nBz3ce/L0rLvuHli9fRb/zWcLnhMf4A3bAeYt/ZrqUb9+ftvS8hSZIkSZIkSZIkSZIkSZIkSZKkpizufYFJWTdcvKaU9qWuQsi94dvv76bey12ouMwb7q+/fYv9p0oNuTf8+4HmR9FblZR7w///K1kL789Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces+zkN7zLKT3PAvpPc9Ces8rVjg+z5HzVwrLYc5JY7HCmQ7Rvu0pemTlwnBiOLB6YVqGzvuMH1i9cBU6b23hAxXGnqVf7RRG32l20w/9GIXhT4tFP/3gRQtXsz7ob2JP0Yt5n/g3sde9JEmSJEmSpDm+AR4rFD68DEz5AAAAAElFTkSuQmCC"
              alt=""
            />
            <h1 class="title is-5 has-text-black mt-2">Full Screen Mode</h1>
            <p class="subtitle is-6 has-text-grey mt-2">
              Enable full screen mode for better experience
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot has-text-centered"
          style={{ background: "white", border: 0 }}
        >
          <button
            class="button is-fullwidth is-rounded"
            style={{ background: "#3D83FF", color: "white" }}
            onClick={() => {
              setHintModal(!hintModal)
              toggleFullScreen()
            }}
          >
            Apply
          </button>
        </footer>
      </div>
    </div>
  )
}
