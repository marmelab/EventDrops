import drop from './drop';

export default (config, width) =>
    selection => {
        const {
            label: {
                width: labelWidth,
            },
            line: {
                color: lineColor,
                height: lineHeight,
            },
        } = config;

        const xScale = d3
            .scaleTime()
            .domain([config.range.start, config.range.end])
            .range([0, width - labelWidth]);

        const lines = selection.selectAll('.drop-line').data(d => d);

        const g = lines
            .enter()
            .append('g')
            .classed('drop-line', true)
            .attr('fill', lineColor)
            .attr(
                'transform',
                (_, index) => `translate(0, ${(index + 0.5) * lineHeight})`
            );

        g.append('text').text(d => d.name);

        g
            .append('g')
            .classed('drops', true)
            .attr('transform', () => `translate(${labelWidth}, 0)`)
            .call(drop(config, xScale));

        lines.exit().remove();
    };
