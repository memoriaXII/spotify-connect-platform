import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"

import { PlaylistContext } from "../../../context/playlist"

const ChartsContainer = (props) => {
  const { top50TracksList, viral50TracksList } = useContext(PlaylistContext)
  const settings = {
    arrows: true,
    dots: false,
    speed: 500,
    infinite: true,
    slidesPerRow: 4,
    rows: 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 478,
        settings: {
          slidesPerRow: 1,
          rows: 3,
        },
      },
    ],
  }
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const buildItems = () => {
    return (
      <Slider {...settings}>
        {top50TracksList.map((item, index) => {
          return (
            <div class="chart__item container">
              <div key={index} class="columns is-variable is-2 is-mobile">
                <div
                  class="column is-2 has-text-centered"
                  style={{
                    border: `${1}px solid rgba(213, 213, 213, 0.5)`,
                    margin: "auto",
                    backgroundSize: "cover",
                    borderRadius: 5,
                    height: 50,
                    width: 50,
                    marginRight: "auto",
                    backgroundImage: `url(${
                      item.track && item.track.album.images[0].url
                    })`,
                  }}
                ></div>
                <div class="column is-10">
                  <span class="title is-7 has-text-black">
                    {item.track && item.track.name}
                    <br />
                    <span class="has-text-grey">
                      {item.track.artists[0].name}
                    </span>
                  </span>
                  <div class="chart__item__play__button">
                    <a href="javascript:void(0)">
                      <button class="button">
                        <FontAwesomeIcon icon={faPause} />
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </Slider>
    )
  }

  const buildItems2 = () => {
    return (
      <Slider {...settings}>
        {viral50TracksList.map((item, index) => {
          return (
            <div class="container">
              <div key={index} class="columns is-gapless is-mobile mt-2">
                <div
                  class="column is-2 has-text-centered"
                  style={{
                    backgroundSize: "cover",
                    borderRadius: 5,
                    height: 50,
                    width: 50,
                    marginRight: "auto",
                    backgroundImage: `url(${
                      item.track && item.track.album.images[0].url
                    })`,
                  }}
                ></div>
                <div class="column is-10">
                  <span class="title is-7 has-text-black">
                    {item.track && item.track.name}
                    <br />
                    <span class="has-text-grey">
                      {item.track.artists[0].name}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </Slider>
    )
  }

  return (
    <div class="mb4">
      <div class="ad__header">
        <h2 class="ad__headline has-text-black">
          <div class="title is-5">Charts</div>
        </h2>
      </div>
      <hr class="mb-2 mt-3" />
      {buildItems()}
    </div>
  )
}

export default ChartsContainer

function SampleNextArrow(props) {
  const { className, style, onClick } = props
  return (
    <div class="ad__arrows">
      <button
        className={`${className} arrow arrow-next`}
        style={{ zIndex: 99, width: 70 }}
        type="button"
        onClick={onClick}
      ></button>
    </div>
  )
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props
  return (
    <>
      <div class="ad__arrows">
        <button
          className={`${className} arrow arrow-prev`}
          style={{ zIndex: 99, width: 70 }}
          type="button"
          onClick={onClick}
        ></button>
      </div>
    </>
  )
}

const Tabs = (props) => {
  const [selected, setSelected] = useState(props.selected || 0)
  function handleChange(index) {
    setSelected(index)
  }

  return (
    <div>
      <div className="tabs mt-4">
        <ul>
          {props.children.map((elem, index) => {
            let style = index == selected ? "is-active" : ""
            return (
              <li
                className={style}
                key={index}
                onClick={() => {
                  handleChange(index)
                }}
              >
                {/* <img
                  style={index == selected ? { filter: `invert(1)` } : {}}
                  src={elem.props.icon}
                  alt=""
                /> */}
                <a class="has-text-black">{elem.props.title}</a>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="content">{props.children[selected]}</div>
    </div>
  )
}

const TabsGroup = (props) => {
  const { buildItems, buildItems2 } = props
  return (
    <Tabs selected={0}>
      <TabsContent title="Popular">{buildItems()}</TabsContent>
      <TabsContent title="Viral">{buildItems2()}</TabsContent>
    </Tabs>
  )
}

const TabsContent = (props) => {
  return <div>{props.children}</div>
}