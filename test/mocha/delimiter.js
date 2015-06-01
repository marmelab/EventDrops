"use strict";

var assert = require('assert');
var document = require('jsdom').jsdom("<html><head></head><body></body></html>");
var d3 = require('d3');

var delimiter = require('../../lib/delimiter')(d3);

describe('delimiter', function () {
  var graph, element, dateFormat, startDate, endDate;

  beforeEach(function () {
    startDate = new Date(0);
    endDate = new Date();
    var xScale = d3.time.scale().range([0, 1000]).domain([startDate, endDate]);
    dateFormat = d3.locale({
      "decimal": ",",
      "thousands": " ",
      "grouping": [3],
      "dateTime": "%A %e %B %Y, %X",
      "date": "%d/%m/%Y",
      "time": "%H:%M:%S",
      "periods": ["AM", "PM"],
      "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
      "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      "shortMonths": ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
    }).timeFormat("%d %B %Y");

    graph = delimiter({xScale: xScale, dateFormat: dateFormat});

    element = d3.select(document.createElement('svg'));
    graph(element);
  });

  it('should add a start with date set to start of scale', function () {
    element.each(function () {
      var text = d3.select(this).select('.start').text();

      assert.equal(text, dateFormat(startDate));
    });
  });

  it('should add a end with date set to end of scale', function () {
    element.each(function () {
      var text = d3.select(this).select('.end').text();

      assert.equal(text, dateFormat(endDate));
    });
  });

});
