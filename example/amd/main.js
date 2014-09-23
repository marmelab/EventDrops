
require.config({
    paths: {
        'd3': '../../node_modules/d3/d3',
        'd3.chart.eventDrops': '../../src/eventDrops'
    },
    shim: {
        'd3.chart.eventDrops': {
            deps: ['d3'],
            exports: 'd3.chart.eventDrops'
        }
    }
});

require(['d3', 'd3.chart.eventDrops'], function(d3) {
    var body = document.getElementsByTagName('body')[0];

    var names = ["Lorem", "Ipsum", "Dolor", "Sit", "Amet", "Consectetur", "Adipisicing", "elit", "Eiusmod tempor", "Incididunt"];
    var data = [];
    var endTime = Date.now();
    var month = 30 * 24 * 60 * 60 * 1000;
    var startTime = endTime - 6 * month;

    function createEvent (name, maxNbEvents) {
        maxNbEvents = maxNbEvents | 200;
        var event = {
            name: name,
            dates: []
        };

        // add up to 200 events
        var max =  Math.floor(Math.random() * maxNbEvents);
        for (var j = 0; j < max; j++) {
            var time = (Math.random() * (endTime - startTime)) + startTime;
            event.dates.push(new Date(time));
        }

        return event;
    }

    for (var i = 0; i < 10; i++) {
        data.push(createEvent(names[i]));
    }

    var graph = d3.chart.eventDrops({
        start: new Date(startTime),
        end: new Date(endTime)
    });

    var element = d3.select(body).append('div').datum(data);
    graph(element);
});
