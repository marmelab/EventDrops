const configurable = require('./util/configurable');
const filterData = require('./filterData');

import configure from './configure';
import d3 from 'd3';

const defaultConfig = {
    xScale: null,
    eventColor: null,
};

export default function(config = {}) {
    const finalConfiguration = configure(config, defaultConfig);

    function eventLine(selection) {
        selection.each(function eventLineSelectionIterator() {
            d3.select(this).selectAll('text').remove();

            d3.select(this).append('text')
                .text((d) => {
                    const count = filterData(d.dates, config.xScale).length;
                    return d.name + (count > 0 ? ' (' + count + ')' : '');
                })
                .attr('text-anchor', 'end')
                .attr('transform', 'translate(-20)')
                .style('fill', 'black');

            d3.select(this).selectAll('circle').remove();

            const circleContainer = d3.select(this)
                .append('g')
                .style('filter', 'url(#metaball)');

            circleContainer
                .append('rect')
                .attr('width', '40px')
                .attr('height', '40px' )
                .attr('transform', 'translate(0,-25)')
                .style('fill', 'none');

            const circles = circleContainer.selectAll('circle').data((d) => {
                return filterData(d.dates, finalConfiguration.xScale);
            });

            circles.enter()
                .append('circle')
                .attr('cx', (d) => finalConfiguration.xScale(d))
                .style('fill', finalConfiguration.eventColor)
                .attr('cy', -5)
                .attr('r', 5);

            circles.exit().remove();
        });
    }

    configurable(eventLine, config);

    return eventLine;
  };
