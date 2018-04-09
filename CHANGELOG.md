# CHANGELOG

### 1.1.x

**1.2.0:**

[#238](https://github.com/marmelab/EventDrops/pull/238): allow to tune the property name when events are not in the `data` property

**1.1.2:**

[#234](https://github.com/marmelab/EventDrops/pull/234): display labels over drops

**1.1.1:**

[#233](https://github.com/marmelab/EventDrops/pull/233): fix default export for users without module bundler

**1.1.0:**

[#232](https://github.com/marmelab/EventDrops/pull/232): minor README fixes
[#231](https://github.com/marmelab/EventDrops/pull/231): allow to display chart from end to start

### 1.0.2

[#228](https://github.com/marmelab/EventDrops/pull/228): use configuration date getter when filtering data
[#213](https://github.com/marmelab/EventDrops/pull/212): publish Git tag automatically when publishing on npm

### 1.0.1

[#212](https://github.com/marmelab/EventDrops/pull/212): fix issue when having other SVG elements than EventDrops
[#210](https://github.com/marmelab/EventDrops/pull/210): fix demo deployment
[#208](https://github.com/marmelab/EventDrops/pull/208): fix documentation wrong asset path

## 1.0.0

* Huge performance boost (almost 10 times faster when zooming or panning)
* Review configuration to get more intuitive naming
* Simplify tick format configuration passing only time formats instead of a whole function
* Fix zoom and panning center
* Better integration with module bundlers (allowing to pass a local D3 object instead of the global one)

We took profit of this major version change to improve the API - unfortunately, we couldn't keep backwards compatibility. See the [migration guide](./MIGRATION-4.0.md) for more informations.

## 0.3.0

* API Change: The data for each event line object must now be in the `data` property (was `date`).
* Pass any data object to each drop and specify the date property with a callback.
* The SVG is now responsive and fit with its parent
* Rename `eventHover`, `eventClick` and `eventZoom` events to `mouseover`, `click` and `zoomend` respectively.
* Adding `mouseout` handler

## 0.2.0

* Display metaballs by default instead of simple dots
* Adding `eventClick` event handler on drops
* Use of Webpack instead of Babel for development tasks
* Full rewrite of the code base for better code splitting (may cause some BC breaks)
