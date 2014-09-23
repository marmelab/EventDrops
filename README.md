EventDrops
==========

A time based / event series interactive visualization using d3.js.

(TODO add video)

## Usage

Include the `src/eventDrops.js` script in your page after d3:

```html
<script src="path/to/d3.js"></script>
<script src="src/eventDrops.js"></script>
```

**Tip**: You can also user RequireJs, see [example/amd](https://github.com/marmelab/EventDrops/tree/master/example/amd) for an implementation.

In the HTML source, create a new EventDrops chart, bind data to a DOM element, then call the chart on the element.

```js
var eventDropsChart = d3.chart.eventDrops();
d3.select('#chart_placeholder')
  .datum(data)
  .call(eventDropsChart);
```

The data must be an array of named time series. For instance:

```js
var data = [
  { name: "http requests", dates: [new Date('2014/09/15 13:24:54'), new Date('2014/09/15 13:25:03'), new Date('2014/09/15 13:25:05'), ...] },
  { name: "SQL queries", dates: [new Date('2014/09/15 13:24:57'), new Date('2014/09/15 13:25:04'), new Date('2014/09/15 13:25:04'), ...] },
  { name: "cache invalidations", dates: [new Date('2014/09/15 13:25:12'), ...] }
];
```

## Configuration

EventDrops follows the [d3.js reusable charts pattern](http://bost.ocks.org/mike/chart/) to let you customize the chart at will:

```js
var eventDropsChart = d3.chart.eventDrops()
  .width(1200)
  .hasTopAxis(false);
```

Configurable values:

  - `start`: start date of the scale. Defaults to `new Date(0)`.
  - `end`: end date of the scale. Defaults to `new Date()`
  - `width`: width of the chart in pixels. Default to 1000px.
  - `margin`: margins of the graph in pixels. Defaults to `{ top: 60, left: 200, bottom: 40, right: 50 }`
  - `locale`: locale used for the X axis labels. See [d3.locale](https://github.com/mbostock/d3/wiki/Localization#locale) for the expected format. Defaults to null (i.e. d3 default locale).
  - `tickFormat`: tickFormat for the X axis. See [d3.timeFormat.multi()](https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi) for expected format.
  - `hasDelimiter`: whether to draw time boundaries on top of the chart. Defaults to true.
  - `hasTopAxis`: whether the chart has a top X axis. Accepts both a boolean or a function receiving the data of the graph that returns a boolean.
  - `hasBottomAxis`: same as topAxis but for the bottom X axis
  - `eventColor`: The color of the event line. Accepts a color (color name or `#ffffff` notation), or a function receiving the eventData and returning a color. Defaults to 'black'.

## Styling

You can style all elements of the chart in CSS. Check the source to see the available selectors.

## Extending / Hacking

First, install the dependencies:

```sh
$ make install
```

Source files are located under the `lib/` folder, and use [browserify](http://browserify.org/) for dependency management. Once your changes are finished, regenerate the combined source under `src/` by calling the following command:

```sh
$ make browserify
```

You can test the result by launching a server at the project root, and navigating to the `examples/` directory.

## License

EventDrops is released under the MIT License, courtesy of [marmelab](http://marmelab.com) and [Canal Plus](https://github.com/canalplus).
