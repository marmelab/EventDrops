# Migrating from v3 to v4

## In theory...

The API has been deeply reviewed to both simplify configuration, and improve overall performances. We chose to break backward compatibility to allow the implementation of the new features. That means you will probably need to rewrite your current scripts to make them work with the new version.

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

## And in Practice

Let's consider the [demo code](http://www.marmelab.com/EventDrops). Before, we displayed a drop chart using the following code:

```js
const chart = eventDrops()
    .start(new Date(new Date().getTime() - 3600000 * 24 * 365)) // one year ago
    .end(new Date())
    .eventLineColor((d, i) => colors[i])
    .date(d => new Date(d.date))
    .mouseover(showTooltip)
    .mouseout(hideTooltip)
    .zoomend(updateInfos);

d3
    .select('#container')
    .datum(repositoriesData)
    .call(chart);
```

With 4.0 version, our code becomes:

```js
const chart = eventDrops({
    drop: {
        date: d => new Date(d.date),
        onMouseOver: showTooltip,
        onMouseOut: hideTooltip,
    },
    zoom: {
        onZoomEnd: updateInfos,
    }
    line: {
        color: (_, i) => d3.schemeCategory10[i],
    }
    range: {
        start: new Date(new Date().getTime() - (3600000 * 24 * 365)), // one year ago
        end: new Date(),
    }
});

d3.select('#container').data(repositoriesData).call(chart);
```

Note that `line` and `range` parameters are not mandatory in this example, as they use default values.
