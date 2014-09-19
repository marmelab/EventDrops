EventDrops
==========

A simple d3 plugin to visualize time occurrences of various events in an interactive chart looking like the following:
(TODO add video)

With data looking like :
```json
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

## usage
```json
var eventDrops = d3.chart.eventDrops();
d3.select('#element').datum(data).call(eventDrops);
```
