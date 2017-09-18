import drop from './drop';

export default (config, xScale) =>
    selection => {
        const {
            label: {
                padding: labelPadding,
                width: labelWidth,
            },
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
                (_, index) => `translate(0, ${index * lineHeight})`
            );

        g
            .append('line')
            .classed('line-separator', true)
            .attr('x1', labelWidth)
            .attr('x2', '100%')
            .attr('y1', () => lineHeight)
            .attr('y2', () => lineHeight);

        g
            .append('text')
            .attr('x', labelWidth - labelPadding)
            .attr('y', lineHeight / 2)
            .attr('dy', '0.25em')
            .attr('text-anchor', 'end')
            .text(d => `${d.name} (${d.data.length})`);

        g
            .append('g')
            .classed('drops', true)
            .attr(
                'transform',
                () => `translate(${labelWidth}, ${lineHeight / 2})`
            )
            .call(drop(config, xScale));

        lines.exit().remove();
    };
