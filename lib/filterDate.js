"use strict";

module.exports = function filterDate(dates, maxDate, minDate) {
  dates = dates || [];
  var filteredDates = [];
  var maxTime = maxDate.getTime();
  var minTime = minDate.getTime();
  dates.forEach(function (date) {
    var time = date.getTime();
    if (time < minTime || time > maxTime) {
      return;
    }
    filteredDates.push(date);
  });

  return filteredDates;
};
