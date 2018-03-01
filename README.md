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

Since version 1.0, `event-drops` follows [semantic versionning](https://semver.org/). Hence, we recommend checking your `package.json` file and ensure that `event-drops` version is preceded by a carret:

```js
{
    "event-drops": "^1.0.0"
}
```

This way, you'll get all bug fixes and non breaking new features.

## Usage

### Without a Module Bundler

If you **don't** use any module bundler such as Webpack, we recommend using EventDrop script available on [unpkg.com](https://unpkg.com/event-drops). Grabbing last versions of the library is as simple as:

```xml
<link href="https://unpkg.com/event-drops/dist/style.css" rel="stylesheet" />

<script src="https://unpkg.com/d3"></script>
<script src="https://unpkg.com/event-drops/dist/index.js"></script>
```

### With a Module Bundler

If you use a module bundler, you can import EventDrops the following way:

```js
import * as d3 from 'd3/build/d3';

import eventDrops from 'event-drops';

const chart = eventDrops({ d3 });

const repositoriesData = [
    { name: "admin-on-rest", data: [{ date: new Date('2014/09/15 14:21:31') }, /* ... */] },
    { name: "event-drops", data: [{ date: new Date('2014/09/15 13:24:57') }, /* ... */] },
    { name: "sedy", data: [{ date: new Date('2014/09/15 13:25:12') }, /* ... */] }
];

d3.select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart);
```

You can either use D3 as a specific import (specifying it in first argument of `eventDrops` call), or use the global one. By default, it fallbacks to a global defined `d3`.

## Interface

`eventDrops` function takes as a single argument a configuration object, detailed in the:

**[Configuration Reference](./docs/configuration.md)**

In addition to this configuration object, it also exposes some public methods allowing you to customize your application based on filtered data:

* **scale()** provides the horizontal scale, allowing you to retrieve bounding dates thanks to `.scale().domain()`,
* **filteredData()** returns an object with both `data` and `fullData` keys containing respectively bounds filtered data and full dataset.
* **draw(config, scale)** redraw chart using given configuration and `d3.scaleTime` scale

Hence, if you want to display number of displayed data and time bounds as in the [demo](https://marmelab.com/EventDrops/), you can use the following code:

```js
const updateCommitsInformation = chart => {
    const filteredData = chart
        .filteredData()
        .reduce((total, repo) => total.concat(repo.data), []);

    numberCommitsContainer.textContent = filteredData.length;
    zoomStart.textContent = humanizeDate(chart.scale().domain()[0]);
    zoomEnd.textContent = humanizeDate(chart.scale().domain()[1]);
};
```

## Contributing

If you want to contribute to EventDrops, first, thank you!

To launch the project locally, grab this repository, install its dependencies, and launch the demo:

```sh
git clone git@github.com:marmelab/EventDrops.git
cd EventDrops
make install
make run
```

Demo will then be available on [http://localhost:8080](http://localhost:8080). Source files are watched automatically. Changing one file would automagically reload your browser.

When you are satisfied with your changes, ensure you didn't break anything launching tests:

```sh
make test
```

Finally, if everything is fine, you can then create a pull request.

Feel free to ask some help on [GitHub issue tracker](https://github.com/marmelab/EventDrops/issues). The core team would be glad to help you to contribute.

## License

EventDrops is released under the MIT License, courtesy of [marmelab](http://marmelab.com) and [Canal Plus](https://github.com/canalplus). It means you can use this tool without any restrictions.
