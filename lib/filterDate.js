"use strict";

module.exports = function filterDate(dates, timeScale) {
  dates = dates || [];
  var filteredDates = [];
  var boundary = timeScale.domain();
  var minTime = boundary[0].getTime();
  var maxTime = boundary[1].getTime();
  dates.forEach(function (date) {
    var time = date.getTime();
    if (time < minTime || time > maxTime) {
      return;
    }
    filteredDates.push(date);
  });

  return filteredDates;
};
