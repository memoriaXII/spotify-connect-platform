import React, { memo } from "react"

export default memo((props) => {
  return (
    <table class="playlist">
      <colgroup>
        <col width="3%" />
        <col width="3%" />
        <col width="35%" />
        <col width="23%" />
        <col width="23%" />
        <col width="7%" />
        <col width="3%" />
        <col width="3%" />
      </colgroup>
      <tr class="playlist__tr">
        <th class="playlist__th"></th>
        <th class="playlist__th"></th>
        <th class="playlist__th">TITLE</th>
        <th class="playlist__th">ALBUM</th>
        <th class="playlist__th">LENGTH</th>
        <th class="playlist__th">
          <i class="far fa-calendar-alt"></i>
        </th>
        <th class="playlist__th"></th>
        <th class="playlist__th"></th>
      </tr>

      {props.children}
    </table>
  )
})
