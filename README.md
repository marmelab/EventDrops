# EventDrops

EventDrops is a time based / event series interactive visualization using d3.js. Pan and zoom your data in an eye-candy timeline.

![EventDrops example](https://cloud.githubusercontent.com/assets/688373/18343222/c0a897b2-75b2-11e6-96df-e72e4b02335a.gif)

[See the demo](http://marmelab.com/EventDrops/)

## Installation

You can either use `yarn` or `npm` to install event-drops:

```
yarn add event-drops
npm install --save event-drops
```

Note you don't need this step if you don't use any module bundler.

Since version 4, `event-drops` follows [semantic versionning](https://semver.org/). Hence, we recommend checking your `package.json` file and ensure a `event-drops` version is preceded by a carret:

``` js
{
    "event-drops": "^4.0.0"
}
```

## Usage

### Without a Module Bundler

If you **don't** use any module bundler such as Webpack, we recommend using EventDrop script available on [unpkg.com](https://unpkg.com/event-drops). Grabbing last versions of the library is as simple as:

``` xml
<link href="https://unpkg.com/event-drops/dist/eventDrops.css" rel="stylesheet" />

<script src="https://unpkg.com/d3"></script>
<script src="https://unpkg.com/event-drops@0.3.1-alpha4/dist/eventDrops.js"></script>
```

### With a Module Bundler

If you use a module bundler, you can use EventDrops the following way:

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

You can either use D3 as a specific import (specifying it in first argument of `eventDrops` call), or use the global one. By default, `event-drops` fallbacks to a global defined `d3`.

`event-drops` does not expect any particular data format. You can specify which properties to use for the name of each line or for the date corresponding to each drop. See the `Configuration` section below for more details.

## Configuration

The `eventDrops` function takes a configuration object as only parameter. Here is the default configuration as a reference for all available parameters:

``` js
({
    // instance of d3 to use, useful when importing d3 from a module bundler
    d3: window.d3,

    // @TODO
    locale: 'en',

    // if false, disable metaballs feature
    metaballs: {
        // blur intensity: higher the value, bigger the metaballs
        blurDeviation: 10,
        // metaballs matrix: tweak at your own risks ;)
        colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10',
    },

    // related to timeline bounds (displayed on bottom left and right)
    bound: {
        // formatting function for bounding dates
        format: d3.timeFormat('%d %B %Y'),
    },

    line: {
        // line color, can be a function taking row data as argument
        color: (_, index) => d3.schemeCategory10[index],

        // line height, can be a function taking row data as argument
        height: 40,
    },

    // individual event drop style
    drop: {
        // drop color, overriding line color if not null
        // can be a function taking drop data as argument
        color: null,

        // drop radius, can be a function taking drop data as argument
        radius: 5,

        // @TODO
        date: d => d.date,
    },

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

    mouse: {
        // @TODO
        onHover: null,
        onClick: null,
        onMouseOut: null,
    }
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
