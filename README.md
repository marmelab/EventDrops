# EventDrops

EventDrops is a time based / event series interactive visualization tool powered by D3.js.

![EventDrops example](https://cloud.githubusercontent.com/assets/688373/18343222/c0a897b2-75b2-11e6-96df-e72e4b02335a.gif)

If you want to pan and zoom on previous data on your own, here is the [demo](http://marmelab.com/EventDrops/).

## Installation

EventDrops is provided as an `npm` package. Grab it using the tool of your choice:

```
yarn add event-drops
npm install --save event-drops
```

Note you don't need this step if you don't use any module bundler.

Since version 4, `event-drops` follows [semantic versionning](https://semver.org/). Hence, we recommend checking your `package.json` file and ensure that `event-drops` version is preceded by a carret:

``` js
{
    "event-drops": "^4.0.0"
}
```

This way, you'll get all bug fixes and non breaking new features.

## Usage

### Without a Module Bundler

If you **don't** use any module bundler such as Webpack, we recommend using EventDrop script available on [unpkg.com](https://unpkg.com/event-drops). Grabbing last versions of the library is as simple as:

``` xml
<link href="https://unpkg.com/event-drops/dist/eventDrops.css" rel="stylesheet" />

<script src="https://unpkg.com/d3"></script>
<script src="https://unpkg.com/event-drops@0.3.1-alpha4/dist/eventDrops.js"></script>
```

### With a Module Bundler

If you use a module bundler, you can import EventDrops the following way:

``` js
import * as d3 from 'd3/build/d3';

import eventDrops from 'event-drops';

const chart = eventDrops({ d3 });

const repositoriesData = [
    { name: "admin-on-rest", data: [{ date: new Date('2014/09/15 14:21:31') }, /* ... */ ,]
    { name: "event-drops", data: [{ date: new Date('2014/09/15 13:24:57') }, /* ... */ ,]
    { name: "sedy", data: [{ date: new Date('2014/09/15 13:25:12') }, /* ... */] }
];

d3.select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart);
```

You can either use D3 as a specific import (specifying it in first argument of `eventDrops` call), or use the global one. By default, it fallbacks to a global defined `d3`.

## Configuration

The `eventDrops` function takes a configuration object as only parameter. Here are the details of all available configuration keys.

#### Generic Parameters

##### d3

*Default: global.d3*

Instance of D3 to use within EventDrops. It provides a purer way to use EventDrops from a bundled module:

``` js
import * as d3 from 'd3/build/d3'; // no global here
import eventDrops from 'event-drops';

const chart = eventDrops({ d3 });
```

If you use EventDrops without any module bundler, just include D3 script before EventDrops, and everything should work out of the box.

##### locale

*Default: English locale*

D3 locale to use for dates (months and days for instance). This parameter expects a locale from [d3-time-format](https://github.com/d3/d3-time-format) module.

``` js
import frLocale from 'd3-time-format/locale/fr-FR.json';

const chart = eventDrops({
    locale: frLocale,
});
```

A list of all available locales can be found in [d3-time-format/src](https://github.com/d3/d3-time-format/tree/master/locale).

#### Metaballs

*Default: metaballs configuration object (see below)*

EventDrops adds an organic-looking effect between two close events, called "metaballs". This effect can be disabled passing `false` to the `metaballs` property.

##### blurDeviation

*Default: 10*

This parameter influences the size of metaballs. The higher the value, the larger the metaballs will be. A too low value prevents the drops from melting. On the contrary, too high a value may dilute the metaballs too much, making them invisible.

##### colorMatrix

*Default: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 31 -12'*

This parameter with forgotten origins (possibly StackOverflow) is transmitted from EventDrops developer to EventDrops developer. Change it at your own risk!

We're not sure if this setting should be configurable, but for backward compatibility reasons we left it.

#### bound

*Default: bound configuration object*

Bounds are minimum and maximum visible dates, displayed at the bottom of the chart. They are optional and can be disabled passing this property the `false` value.

##### format

*Default: d3.timeFormat('%d %B %Y')*

Display format of bounds. By default, it would be displayed such as "10 January 2018".

#### line

Line parameter contains all line related parameters (thanks Captain Obvious!).

##### color

*Default: (_, index) => d3.schemeCategory10[index]*

This parameter defines color of all drops on a given line (each of these colors can be overwritten at the drop level). It can be either an hard-written value, or a function, taking current data, index, and whole data as arguments.

``` js
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

##### height

*Default: 40*

Should we really explain this parameter? That's the line height.

#### drop

*Default: drop configuration object*

All event drop related configuration is here. Definitely, we made a real effort of naming in this configuration.

##### color

*Default: null*

This parameter defines color of a specific drop. A `null` value means the drop would be of `line.color`. It can be either an hard-written value, or a function, taking current data, index, and whole line data as arguments.

``` js
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

##### radius

*Default: 5

Radius of each drop. It can be either an hard-written value, or a function, taking current data, index, and whole line data as arguments.

``` js
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

##### date

*Default: d => new Date(d)*

This is the transformer turning your event data into a date object. It should be a function returning a JavaScript `Date` object. This function takes three arguments: current data, current data index, and the whole line data.

``` js
const chart = eventDrops({
    drop: {
        date: (d) => new Date(d),
    }
});
```

##### onClick

*Default: () => {}*

Function to be executed when user clicks on a drop. By default, it does nothing. Clicked drop related data is passed as the first argument:

``` js
const chart = eventDrops({
    drop: {
        onClick: (data) => {
            console.log(`Data ${data.id} has been clicked!`);
        },
    },
});
```

##### onMouseOver

*Default: () => {}*

Function to be executed when user moves the mouse on a drop. By default, it does nothing. Hovered drop related data is passed as the first argument:

``` js
const chart = eventDrops({
    drop: {
        onMouseOver: (data) => {
            showTooltip(data);
        },
    },
});
```

This is the function you are looking for if you want to display a tooltip describing some event details.

##### onMouseOut

*Default: () => {}*

Function to be executed when user moves the mouse out of a drop. By default, it does nothing. Blurred drop related data is passed as the first argument:

``` js
const chart = eventDrops({
    drop: {
        onMouseOut: (data) => {
            hideTooltip(data);
        },
    },
});
```

This is the function you are looking for if you want to hide a tooltip you previously displayed with `onMouseOver`.












``` js
    // left labels style
    label: {
        // space between labels and drops container
        padding: 20,

        // text to display, taking row object as argument
        text: d => `${d.name} (${d.data.length})`,

        width: 200,
    },

    // margins around full chart
    margin: {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10,
    },

    // limits of displayed data
    range: {
        start: new Date(new Date().getTime() - 3600000 * 24 * 365), // one year ago
        end: new Date(),
    },

    // @TODO
    timeAxis: {
        tickFormat: '',
        withBoundaries: true,
        withTopAxis: true,
        withBottomAxis: true,
    }

    hasDelimiter

    // if false, disable zoom and panning features
    zoom: {
        // event handler called when starting zooming
        onZoomStart: null,

        // event handler called while zooming
        onZoom: null,

        // event handler called when finishing zooming
        onZoomEnd: null,

        // @TODO
        minimumScale: 0,
        maximumScale: Infinity,
    },
});
```

In addition to this configuration object, `event-drops` exposes two public methods allowing you to customize your application based on filtered data:

* **scale()** provides the horizontal scale, allowing you to retrieve bounding dates thanks to `.scale().domain()`,
* **displayedData()** returns an object with both `data` and `fullData` keys containing respectively bounds filtered data and full dataset.

Hence, if you want to display number of displayed data and time bounds as in the [demo](#), you can use the following code:

``` js
const updateCommitsInformation = (chart) => {
    const filteredData = chart.filteredData().reduce((total, repo) => total.concat(repo.data), []);

    numberCommitsContainer.textContent = filteredData.length;
    zoomStart.textContent = humanizeDate(chart.scale().domain()[0]);
    zoomEnd.textContent = humanizeDate(chart.scale().domain()[1]);
};
```

## Contributing

If you want to contribute to EventDrops, first, thank you!

To launch the project locally, grab this repository and install its dependencies:

``` sh
git clone git@github.com:marmelab/EventDrops.git
cd EventDrops
make install
```

Then, launch the demo with:

``` sh
make run
```

Demo will then be available on [http://localhost:8080]. Source files are watched automatically. Changing one file would automagically reload your browser.

When you are satisfied with your changes, ensure you didn't break anything launching tests:

``` sh
make test
```

Finally, if everything is fine, you can then create a pull request.

Feel free to ask some help on [GitHub issue tracker](https://github.com/marmelab/EventDrops/issues). The core team would be glad to help you contributing.

## License

EventDrops is released under the MIT License, courtesy of [marmelab](http://marmelab.com) and [Canal Plus](https://github.com/canalplus). It means you can visualize all the data you want without any restrictions.
