export const Topbar = (props) => {
  const { userprofile } = props
  const handlelogin = () => {
    window.location = window.location.href.includes("localhost")
      ? "http://localhost:8888/login"
      : "https://spotify-auth-proxy-server.herokuapp.com/login"
  }
  return (
    <div class="main__wrap top-bar">
      <ul class="top-bar__left top-bar__wrap">
        <li class="top-bar__search">
          {/* <i class="top-bar__search--icon top-bar__icon fas fa-search has-text-grey-light">
                        <FontAwesomeIcon icon={faSearch} />
                      </i> */}
          <input
            type="text"
            class="input is-small is-rounded is-light"
            placeholder="Search"
          />
        </li>
      </ul>
      <ul class="top-bar__right top-bar__wrap">
        <li>
          <img
            src={userprofile.images && userprofile.images[0].url}
            class="avatar-small circle"
          />
          {userprofile.display_name}
        </li>
        <li>
          <i class="fas fa-chevron-down"></i>
        </li>
      </ul>
    </div>
  )
}
