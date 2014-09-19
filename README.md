EventDrops
==========

A simple d3 plugin to create this kind of chart :

(TODO add video)

With data looking like :
```
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

And that is used like that:
```
var eventDrops = d3.chart.eventDrops();
d3.select('#element').datum(data).call(eventDrops);
```
