
require.config({
    paths: {
        'd3': '../../node_modules/d3/d3',
        'd3.chart.eventDrop': '../../src/eventDrop'
    },
    shim: {
        'd3.chart.eventDrop': {
            deps: ['d3'],
            exports: 'd3.chart.eventDrop'
        }
    }
});

require(['d3', 'd3.chart.eventDrop'], function(d3) {
    var body = document.getElementsByTagName('body')[0];

    var data = [];
    var endTime = Date.now();
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    var startTime = endTime - oneMonth;

    function createEvent (name) {
        var event = {};
        event.name = name;
        event.dates = [];

        var max =  Math.floor(Math.random() * 100);
        for (var j = 0; j < max; j++) {
            var time = Math.floor((Math.random() * oneMonth)) + startTime;
            event.dates.push(new Date(time));
        }

        return event;
    }

    for (var i = 1; i <= 10; i++) {

        data.push(createEvent("sample " + i));
    }

    var graph = d3.chart.eventDrop({
        start: new Date(startTime),
        end: new Date(endTime)
    });

    var element = d3.select(body).append('div').datum(data);
    graph(element);
});
