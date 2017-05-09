EventDrops
==========

A time based / event series interactive visualization using d3.js. Use drag and zoom to navigate in time. [See the demo](http://marmelab.com/EventDrops/)

![EventDrops example](https://cloud.githubusercontent.com/assets/688373/18343222/c0a897b2-75b2-11e6-96df-e72e4b02335a.gif)


**Note:** new version of EventDrops requires D3.js version 4. If you need to use D3.js version 3, use 0.2.0 instead.

## Installation

You can use `npm` to install event-drops <sup>1</sup>

```
npm install event-drops --save
```

For Bower users, even if Bower is not officially supported, you can still use GitHub URL such as:

```
{
    "dependencies": {
        "eventDrops": "marmelab/EventDrops#0.1.2"
    }
}
```

## Usage

Include the `src/eventDrops.js` script in your page after d3:

```html
<script src="path/to/d3.js"></script>
<script src="src/eventDrops.js"></script>
```

**Tip**: You can also use RequireJs, see [example/amd](https://github.com/marmelab/EventDrops/tree/master/example/amd) for an implementation.

In the HTML source, create a new EventDrops chart, bind data to a DOM element, then call the chart on the element.

```js
var eventDropsChart = d3.chart.eventDrops();
d3.select('#chart_placeholder')
  .datum(data)
  .call(eventDropsChart);
```

The data can be an array of named time series. For instance:

```js
var data = [
  { name: "http requests", data: [new Date('2014/09/15 13:24:54'), new Date('2014/09/15 13:25:03'), new Date('2014/09/15 13:25:05'), ...] },
  { name: "SQL queries", data: [new Date('2014/09/15 13:24:57'), new Date('2014/09/15 13:25:04'), new Date('2014/09/15 13:25:04'), ...] },
  { name: "cache invalidations", data: [new Date('2014/09/15 13:25:12'), ...] }
];
```

You can also generate a chart from any type of data array but this requires us
to supply a function that will return a date from each data point. The complete
data object will be available during the eventColor and eventClick callbacks
for example. An example data set:

```js
var data = [
  { name: "http requests", data: [{date: new Date('2014/09/15 13:24:54'), foo: 'bar1'}, {date: new Date('2014/09/15 13:25:03'), foo: 'bar2'}, {date: new Date('2014/09/15 13:25:05'), foo: 'bar1'}, ...] },
  { name: "SQL queries", data: [{date: new Date('2014/09/15 13:24:57'), foo: 'bar4'}, {date: new Date('2014/09/15 13:25:04'), foo: 'bar6'}, {date: new Date('2014/09/15 13:25:04'), foo: 'bar2'}, ...] }
];
```

And the corresponding "date" function that returns a date for
each data point.

```js
var eventDropsChart = d3.chart.eventDrops()
                              .date(d => d.date);
                              
d3.select('#chart_placeholder')
  .datum(data)
  .call(eventDropsChart);
```

## Configuration

EventDrops follows the [d3.js reusable charts pattern](http://bost.ocks.org/mike/chart/) to let you customize the chart at will:

```js
var eventDropsChart = d3.chart.eventDrops()
  .hasDelimiter(false)
  .hasTopAxis(false);
```

Configurable values:

  - `start`: start date of the scale. Defaults to `new Date(0)`.
  - `end`: end date of the scale. Defaults to `new Date()`
  - `margin`: margins of the graph in pixels. Defaults to `{ top: 60, left: 200, bottom: 40, right: 50 }`
  - `locale`: locale used for the X axis labels. See [d3.locale](https://github.com/mbostock/d3/wiki/Localization#locale) for the expected format. Defaults to null (i.e. d3 default locale).
  - `labelsWidth`: width of the labels. Defaults to `210`.
  - `labelsRightMargin`: margin between labels and drops lines. Defaults to `10`.
  - `axisFormat`: function receiving the d3 axis object, to customize tick number and size.
  - `tickFormat`: tickFormat for the X axis. See [d3.timeFormat.multi()](https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi) for expected format.
  - `mouseover`: function to be called when hovering an event in the chart. Receives the DOM element hovered (uses event delegation). Default: `() => {}`.
  - `zoomend`: function to be called when done zooming on the chart. Receives the d3 scale at the end of the zoom. Default: `() => {}`.
  - `click`: function to be called on click event of data-point (circle). Receives the DOM element hovered (uses event delegation). Default: `() => {}`.
  - `hasDelimiter`: whether to draw time boundaries on top of the chart. Defaults to `true`.
  - `hasTopAxis`: whether the chart has a top X axis. Accepts both a boolean or a function receiving the data of the graph that returns a boolean.
  - `hasBottomAxis`: same as topAxis but for the bottom X axis
  - `eventLineColor`: The color of the event line. Accepts a color (color name or `#ffffff` notation), or a function receiving the eventData and returning a color. Defaults to `'black'`.
  - `eventColor`: The color of the event. Accepts a color (color name or `#ffffff` notation), or a function receiving the eventData and returning a color. Defaults to `null`. EventLineColor will be ignored if this is used.
  - `minScale`: The minimum scaling (zoom out), default to `0`.
  - `maxScale`: The maximum scaling (zoom in), default to `Infinity`.
  - `mouseout`: event handler to execute when mouse leave a drop. Default: `() => {}`.
  - `zoomable`: *true* by default. Enable zoom-in/zoom-out and dragging handlers.
  - `date`: function that returns the date from each data point when passing objects. Defaults to `d=>d`.

## Styling

You can style all elements of the chart in CSS. Check the source to see the available selectors.

## Programmatic Zoom

A handle on the `d3.behaviour.zoom` object used to control the zoom level of the chart can be obtained like so:

```javascript
var eventDropsChart = d3.chart.eventDrops();
var element = d3.select('#chart_placeholder').datum(...);
eventDropsChart.call(eventDropsChart);
var zoom = element[0][0].zoom;
```

The example here shows how to manipulate it: http://bl.ocks.org/mbostock/7ec977c95910dd026812

## Extending / Hacking

First, install the dependencies:

```sh
make install
```

For development purpose, you can use the following command:

``` sh
make run
```

It serves the demo at http://localhost:8080. It also watches source files and live
reloads your browser as soon as a change is detected.

When your changes are done, ensure that all tests pass with:

``` sh
make test
```

Finally, if everything is fine, you can rebuild the library using:

``` sh
make build
```

However, for better Pull Request reviewing, please do not commit the build files
in the same PR. You can then rebuild it once merged.

## License

EventDrops is released under the MIT License, courtesy of [marmelab](http://marmelab.com) and [Canal Plus](https://github.com/canalplus).

## Footnotes
1. The functionality and behaviour documented is not all available in the `0.2.0` release installed by `npm`
