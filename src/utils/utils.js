export const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
}

export const setAlbumImage = (album) => {
  const width = Math.min(...album.images.map((d) => d.width))
  const thumb = album.images.find((d) => d.width === width) || {}
  return thumb.url
}

export function isEqualArray(A, B) {
  if (!Array.isArray(A) || !Array.isArray(B) || A.length !== B.length) {
    return false
  }

  let result = true

  A.forEach((a) =>
    B.forEach((b) => {
      result = a === b
    })
  )

  return result
}

export function validateURI(input) {
  const validTypes = ["album", "artist", "playlist", "show", "track"]

  /* istanbul ignore else */
  if (input && input.indexOf(":") > -1) {
    const [key, type, id] = input.split(":")

    /* istanbul ignore else */
    if (
      key === "spotify" &&
      validTypes.indexOf(type) >= 0 &&
      id.length === 22
    ) {
      return true
    }
  }

  return false
}
