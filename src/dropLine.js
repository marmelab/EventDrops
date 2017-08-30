import drop from './drop';

export default (config, xScale) =>
    selection => {
        const {
            line: {
                color: lineColor,
                height: lineHeight,
            },
        } = config;

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

        g.append('g').classed('drops', true).call(drop(config, xScale));

        lines.exit().remove();
    };
