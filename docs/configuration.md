# Configuration Reference

`eventDrops` function takes a configuration object as only parameter. Here are the details of all available configuration keys.

See the [config.js source](https://github.com/marmelab/EventDrops/blob/master/src/config.js) for additional information.

## d3

_Default: global.d3_

Instance of D3 to use within EventDrops. It provides a purer way to use EventDrops from a bundled module:

```js
import * as d3 from 'd3/build/d3'; // no global here
import eventDrops from 'event-drops';

const chart = eventDrops({ d3 });
```

If you use EventDrops without any module bundler, just include D3 script before EventDrops, and everything should work out of the box.

## locale

_Default: English locale_

D3 locale to use for dates (months and days for instance). This parameter expects a locale from [d3-time-format](https://github.com/d3/d3-time-format) module.

```js
import frLocale from 'd3-time-format/locale/fr-FR.json';

const chart = eventDrops({
    locale: frLocale,
});
```

A list of all available locales can be found in [d3-time-format/src](https://github.com/d3/d3-time-format/tree/master/locale).

## metaballs

_Default: metaballs configuration object (see below)_

EventDrops adds an organic-looking effect between two close events, called "metaballs". This effect can be disabled passing `false` to the `metaballs` property.

### blurDeviation

_Default: 10_

This parameter influences the size of metaballs. The higher the value, the larger the metaballs will be. A too low value prevents the drops from melting. On the contrary, too high a value may dilute the metaballs too much, making them invisible.

### colorMatrix

_Default: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 31 -12'_

This parameter with forgotten origins (possibly StackOverflow) is transmitted from EventDrops developer to EventDrops developer. Change it at your own risk!

We're not sure if this setting should be configurable, but for backward compatibility reasons we left it.

## bound

_Default: bound configuration object_

Bounds are minimum and maximum visible dates, displayed at the bottom of the chart. They are optional and can be disabled passing this property the `false` value.

### format

_Default: d3.timeFormat('%d %B %Y')_

Display format of bounds. By default, it would be displayed such as "10 January 2018".

A list of all available shortcuts can be found on [D3.js README](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format).

## line

Line parameter contains all line related parameters (thanks Captain Obvious!).

### color

_Default: (\_, index) => d3.schemeCategory10[index]_

This parameter defines color of all drops on a given line (each of these colors can be overwritten at the drop level). It can be either an hard-written value, or a function, taking current data, index, and whole data as arguments.

```js
const chart = eventDrops({
    line: {
        color: 'lemonChiffon', // yes, this color really exists!
    },
});

const anotherChart = eventDrops({
    line: {
        (line, index) => index % 2 ? 'lavenderBlush' : 'papayaWhip',
    },
});
```

### height

_Default: 40_

Line height in pixels.

## drops

_Default: row => row.data_

Where are located drops in your row object?

## drop

_Default: drop configuration object_

All event drop related configuration is here. Definitely, we made a real effort of naming in this configuration.

### color

_Default: null_

This parameter defines color of a specific drop. A `null` value means the drop would be of `line.color`. It can be either an hard-written value, or a function, taking current data, index, and whole line data as arguments.

```js
const chart = eventDrops({
    drop: {
        color: 'firebrick',
    },
});

const anotherChart = eventDrops({
    drop: {
        (d, index) => d.value > 10 ? 'green' : 'red',
    },
});
```

### radius

\*Default: 5

Radius of each drop. It can be either an hard-written value, or a function, taking current data, index, and whole line data as arguments.

```js
const chart = eventDrops({
    drop: {
        radius: Math.PI,
    },
});

const anotherChart = eventDrops({
    drop: {
        radius: (d, index) => d.size * 10,
    },
});
```

### date

_Default: d => new Date(d)_

This is the transformer turning your event data into a date object. It should be a function returning a JavaScript `Date` object. This function takes three arguments: current data, current data index, and the whole line data.

```js
const chart = eventDrops({
    drop: {
        date: d => new Date(d),
    },
});
```

### onClick

_Default: () => {}_

Function to be executed when user clicks on a drop. By default, it does nothing. Clicked drop related data is passed as the first argument:

```js
const chart = eventDrops({
    drop: {
        onClick: data => {
            console.log(`Data ${data.id} has been clicked!`);
        },
    },
});
```

### onMouseOver

_Default: () => {}_

Function to be executed when user moves the mouse on a drop. By default, it does nothing. Hovered drop related data is passed as the first argument:

```js
const chart = eventDrops({
    drop: {
        onMouseOver: data => {
            showTooltip(data);
        },
    },
});
```

This is the function you are looking for if you want to display a tooltip describing some event details.

### onMouseOut

_Default: () => {}_

Function to be executed when user moves the mouse out of a drop. By default, it does nothing. Blurred drop related data is passed as the first argument:

```js
const chart = eventDrops({
    drop: {
        onMouseOut: data => {
            hideTooltip(data);
        },
    },
});
```

This is the function you are looking for if you want to hide a tooltip you previously displayed with `onMouseOver`.

## label

### padding

_Default: 20_

Space between labels and drop lines margin in pixels. Should be a number.

### text

_Default: row => `${row.name} (${row.data.length})`_

Text to display for each line. It can either be hard-written, or be a function. In the latter case, it takes as usual three arguments: current line, current line index, and list of all chart lines.

```js
const chart = eventDrops({
    label: {
        text: row => row.title,
    },
});
```

### onMouseOver

_Default: () => {}_

Function to be executed when user moves the mouse on a label. By default, it does nothing. The object for that dropLine is passed as the first argument:

```js
const chart = eventDrops({
    label: {
        onMouseOver: label => {
            showTooltip(label);
        },
    },
});
```

Where `label` argument is the `{ "name": "EventDrops, "data": [...] }` etc. depending on configuration.

This is the function you are looking for if you want to display a tooltip describing the label (either in detail or due to too long name).

### onMouseOut

_Default: () => {}_

Function to be executed when user moves the mouse out of a label. By default, it does nothing. The object for that dropLine is passed as the first argument:

```js
const chart = eventDrops({
    label: {
        onMouseOut: label => {
            hideTooltip(label);
        },
    },
});
```

This is the function you are looking for if you want to hide a tooltip you previously displayed with `onMouseOver`.

### onClick

_Default: () => {}_

Function to be executed when user clicks on a label. By default, it does nothing. The object for that dropLine is passed as the first argument:

```js
const chart = eventDrops({
    label: {
        onClick: label => {
            Console.log(`${label} data is clicked.`);
        },
    },
});
```

## indicator

_Default: indicator configuration object_

Indicators show up when there are data out of the set range accessible through scroll or zoom. They can be disabled passing `false` to the `indicator` property.

### previousText

_Default: ◀_

Text to display when there are events before the displayed date range.

## nextText

_Default: ▶_

Text to display when there are events after the displayed date range.

### width

_Default: 200_

Width of label columns in pixels. It can't be dynamic for now and should be hard-written. However, feel free to submit a pull request!

## margin

_Default: { top: 20, right: 10, bottom: 20, left: 10 }_

Margins around the chart, following the [D3.js margin conventions](http://bl.ocks.org/binaworks/9dce0a385915e8953a45cc6be7fbde42).

## range

_Default: { start: [one year ago], end: [now] }_

Range allows to restrict visible data during a given time frame. By default, it takes all data between one year ago and current date.

To change this behavior, pass it an object with a `start` and `end` key, both of them being a JavaScript `Date` object.

## axis

### formats

_Default: see below example_

Format of top axis ticks. It handles automatically the [multi-scale behavior](https://bl.ocks.org/mbostock/4149176) of time axis format, allowing a simpler configuration.

A list of all available shortcuts can be found on [D3.js README](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format).

```js
const chart = eventDrops({
    axis: {
        formats: {
            // this is the default value
            milliseconds: '%L',
            seconds: ':%S',
            minutes: '%I:%M',
            hours: '%I %p',
            days: '%a %d',
            weeks: '%b %d',
            months: '%B',
            year: '%Y',
        },
    },
});
```

### verticalGrid

_Default: `false`_

Display vertical grid lines. Height of line is equal to number of lines times height of line.
The dropLines can be set to not show by customizing the CSS.
![vertical grid](https://user-images.githubusercontent.com/15114362/50725403-6348da80-10fd-11e9-91f3-f1128b64d172.png)

### tickPadding

_Default: 6_

Same as D3 .tickPadding(), allows to set the padding of the tick. This is the y offset of the label for the axis.

## zoom

This section is related to `zoom` (and pan) behavior. If you want to disable interactivity on your chart, just set this parameter to `false`.

### onZoomStart

_Default: () => {}_

Event listener executed after zooming (or panning) begins, for instance on `mousedown` or `mousewheel` events.

Current datum is passed as first argument. For more details about this function, see the [zoom.on](https://github.com/d3/d3-zoom/blob/master/README.md#zoom_on) documentation.

### onZoom

_Default: () => {}_

Event listener executed while zooming (or panning), for instance on `mousemove` or `mousewheel` events.

Current datum is passed as first argument. For more details about this function, see the [zoom.on](https://github.com/d3/d3-zoom/blob/master/README.md#zoom_on) documentation.

### onZoomEnd

_Default: () => {}_

Event listener executed when zooming (or panning) ends, for instance on `mouseout` or when you stop rolling your mouse wheel.

Current datum is passed as first argument. For more details about this function, see the [zoom.on](https://github.com/d3/d3-zoom/blob/master/README.md#zoom_on) documentation.

### minimumScale

_Default: 0_

This parameter configures the minimum zoom level available. Set it to a not-null value to prevent your users from zooming out.

### maximumScale

_Default: Infinity_

This parameter configures the maximum zoom level available. Set it to a lower value to prevent your users from zooming in too deeply.

### numberDisplayedTicks

\_Default:

```js
const chart = eventDrops({
    numberDisplayedTicks: {
        small: 3,
        medium: 5,
        large: 7,
        extra: 12,
    },
});
```

When reducing chart width, we need to display less labels on the horizontal axis to keep a readable chart. This parameter aims to solve the issue. Hence, on smallest devices, it displays only 3 labels by default at the same time.

### breakpoints

\_Default:

```js
const chart = eventDrops({
    breakpoints: {
        small: 576,
        medium: 768,
        large: 992,
        extra: 1200,
    },
});
```

When reducing chart width, we need to display less labels on the horizontal axis to keep a readable chart. This parameter aims to solve the issue. Hence, we can define breakpoints in pixels.
