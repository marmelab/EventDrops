# Migrating from v3 to v4

API has been deeply reviewed to both simplify configuration and improve overall performances. We didn't take care of backward compatibility during this major changes. Hence, you will probably need to rewrite your current scripts to make it work with this fourth version.

Here is a mapping of common configuration parameters, before and after this change:

| Former Name       | New Name          | Comments                                                     |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| start             | range.start       | Now defaults to one year ago                                 |
| end               | range.end         |                                                              |
| margin            | margins           |                                                              |
| labelsWidth       | label.width       |                                                              |
| labelsRightMargin | label.padding     |                                                              |
| axisFormat        | axis.formats      | Now an object mapping each time format (`%Y` for year, etc.) |
| tickFormat        | N/A               | Removed to ease configuration                                |
| mouseover         | drop.onMouseOver  |                                                              |
| zoomend           | zoom.onZoomEnd    |                                                              |
| click             | drop.onClick      |                                                              |
| hasDelimiter      | N/A               | Set `false` to `bounds` parameter to remove them.            |
| hasTopAxis        | N/A               | Removed during chart redesign                                |
| hasBottomAxis     | N/A               | Removed during chart redesign                                |
| eventLineColor    | line.color        |                                                              |
| eventColor        | drop.color        |                                                              |
| minScale          | zoom.minimumScale |                                                              |
| maxScale          | zoom.maximumScale |                                                              |
| mouseout          | drop.onMouseOut   |                                                              |
| zoomable          | N/A               | Set `false` to `zoom` to disable zoom.                       |
| date              | drop.date         |                                                              |

We also renamed the two exposed methods:

* Use `scale` instead of `scales` to retrieve currently displayed time range,
* Use `filteredData` instead of `visibleDataInRow` to retrieve currently displayed data.
