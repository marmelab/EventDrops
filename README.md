EventDrops
==========

A simple d3 plugin to visualize time occurrences of various events in an interactive chart looking like the following:
(TODO add video)

With data looking like :
```js
[
  {
    name: 'sample 1',
    dates: [
      new date(1411114766616),
      new Date(1411115766616),
      new Date(1411116766616),
      ...
    ]
  },
  {
    name: 'sample 2',
    dates: [...]
  },
  ...
]
```

## Usage

include the script in your page after d3

```html
<script src="../path/to/d3/d3.js"></script>
<script src="src/eventdrops.js"></script>
```

It can also be used with requirejs see example/amd

```js
var eventDrops = d3.chart.eventDrops();
d3.select('#element').datum(data).call(eventDrops);
```

## Configuration

d3.chart.eventDrops is configurable:
```js
  // configuration can be set at start.
  var eventDrops = d3.chart.eventDrops({
    width: 2000
  });

  // configuration can also be accessed and modified at any time
  eventDrops.width(); // return 2000
  eventDrops.width(1000); // set width to 1000
```

Configurable values:

  - start: Start date of the scale default to new Date(0)

  - end: end date of the scale default to new Date()

  - width: width of the chart, default to 1000

  - margin: margin of the graph

  - locale: locale of the chart

    (see [d3.locale](https://github.com/mbostock/d3/wiki/Localization#locale))
    default to null (d3 default locale)

  - tickFormat: tickFormat for the xAxis
    see format array asked by [d3.timeFormat.multi()](https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi) method
    default to d3 default values

  - delimiter: A delimiter sub graph.

    By default display the start and end date of the scale(can be disabled with null, or replaced all together)

  - hasTopAxis: Wether the chart has a topAxis.

    Accept both a boolean or a function receiving the data of the graph that return a boolean
  - hasBottomAxis: same as topAxis but for the bottom one

  - eventColor: The color of the event line

    Accept a color (colorname or '#ffffff' notation) or a function receiving the eventData and returning a color (default to 'black')
