import React, { useRef, useState, useEffect } from "react"

const Player = (props) => {
  const { userCurrentPlayingTrack, currentPlayingState } = props
  const backgroundStyles = {
    backgroundImage: `url(${
      userCurrentPlayingTrack &&
      userCurrentPlayingTrack.album &&
      userCurrentPlayingTrack.album.images[0].url
    })`,
  }

  const progressBarStyles = {
    width:
      (currentPlayingState.progress_ms * 100) /
        userCurrentPlayingTrack.duration_ms +
      "%",
  }

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
  }

  return (
    <div className="App">
      <div className="main-wrapper">
        <div className="now-playing__side">
          <div className="now-playing__name">
            {userCurrentPlayingTrack.name}
            {millisToMinutesAndSeconds(currentPlayingState.progress_ms)}
          </div>
          <div className="now-playing__artist">
            {userCurrentPlayingTrack &&
              userCurrentPlayingTrack.artists &&
              userCurrentPlayingTrack.artists[0].name}
          </div>
          <div className="now-playing__status">
            {/* {props.is_playing ? "Playing" : "Paused"} */}
          </div>
          <div className="progress">
            <div className="progress__bar" style={progressBarStyles} />
          </div>
        </div>
        {/* <div className="background" style={backgroundStyles} /> */}
      </div>
    </div>
  )
}

export default Player
