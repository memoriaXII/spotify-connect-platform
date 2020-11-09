import React, { useRef, useState, useEffect } from "react"
import debounce from "lodash.debounce"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const CategoriesContainer = (props) => {
  const { categoriesData } = props
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const checkForScrollPosition = () => {
    const { scrollLeft, scrollWidth, clientWidth } = container.current

    setstate({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft !== scrollWidth - clientWidth,
    })
  }

  const checkForOverflow = () => {
    const { scrollWidth, clientWidth } = container.current
    // const hasOverflow = scrollWidth > clientWidth
    setstate({ hasOverflow: scrollWidth > clientWidth })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
  }

  const buildItems = () => {
    return categoriesData.map((item, index) => {
      return (
        <li class="hs__item" key={index}>
          <div class="hs__item__image__wrapper">
            <img class="hs__item__image" src={item.icons[0].url} alt="" />
          </div>
          <div class="hs__item__description" style={{ margin: "auto" }}>
            <div style={{ marginTop: 20 }}></div>
            <span class="hs__item__title" style={{ fontSize: 15 }}>
              {item.name}
            </span>
            {/* <span class="hs__item__subtitle">{item.user.name}</span> */}
          </div>
        </li>
      )
    })
  }

  const buildControls = () => {
    const { canScrollLeft, canScrollRight } = state
    return (
      <>
        <div class="hs__arrows">
          <button
            class={
              !canScrollLeft ? "arrow arrow-prev disabled" : "arrow arrow-prev"
            }
            type="button"
            disabled={!canScrollLeft}
            onClick={() => {
              scrollContainerBy(-200)
            }}
          ></button>

          <button
            class={
              !canScrollRight ? "arrow arrow-next disabled" : "arrow arrow-next"
            }
            type="button"
            disabled={!canScrollRight}
            onClick={() => {
              scrollContainerBy(200)
            }}
          ></button>
        </div>
      </>
    )
  }

  useEffect(() => {
    checkForOverflow()
    checkForScrollPosition()
    container.current.addEventListener("scroll", debounceCheckForScrollPosition)
    return (
      () =>
        container.current.removeEventListener(
          "scroll",
          debounceCheckForScrollPosition
        ),
      debounceCheckForOverflow.cancel()
    )
  }, [])
  const prevState = usePrevious(categoriesData)

  useEffect(() => {
    if (undefined !== prevState && categoriesData.length) {
      if (prevState.length !== categoriesData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, categoriesData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline title is-5 has-text-white">Popular Artists</h2>
        {buildControls()}
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default CategoriesContainer
