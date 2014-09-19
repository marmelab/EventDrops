var assert = require('assert');
var d3 = require('d3');

var filterData = require('../../lib/filterData');

describe('filterData', function () {
  it ('should remove value outside of the range of the given scale', function () {
    var scale = d3.scale.linear().range([0, 1000]).domain([0, 1000]);
    var data = [-1, 0, 500, 1000, 1001];
    assert.deepEqual(filterData(data, scale), [0, 500, 1000]);
  });

  it ('should work with timeScale and date', function () {
    var scale = d3.time.scale().range([0, 1000]).domain([new Date(10), new Date(1000)]);
    var data = [new Date(0), new Date(10), new Date(500), new Date(1000), new Date(1001)];
    assert.deepEqual(filterData(data, scale), [new Date(10), new Date(500), new Date(1000)]);
  });
});
