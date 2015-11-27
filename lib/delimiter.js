import configure from './configure';
import configurable from './util/configurable';
import d3 from 'd3';

export default (config = {}) => {
    const finalConfiguration = configure(config, {
        xScale: null,
        dateFormat: config.locale ? config.locale.timeFormat("%d %B %Y") : d3.time.format("%d %B %Y"),
    });

    function delimiter(selection) {
        selection.each(function delimiterIterator() {
            d3.select(this).selectAll('text').remove();

            const limits = config.xScale.domain();
            d3.select(this).append('text')
                .text(() => finalConfiguration.dateFormat(limits[0]))
                .classed('start', true);

            d3.select(this).append('text')
                .text(() => config.dateFormat(limits[1]))
                .attr('text-anchor', 'end')
                .attr('transform', `translate(${config.xScale.range()[1]})`)
                .classed('end', true);
        });
    }

    configurable(delimiter, config);

    return delimiter;
};
