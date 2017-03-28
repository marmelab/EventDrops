export default (scales, configuration, dimensions) =>
    (container, data) => {
        const separators = container.selectAll('.line-separator').data(data);

        separators
            .enter()
            .append('g')
            .classed('line-separator', true)
            .attr(
                'transform',
                (d, i) =>
                    `translate(0, ${scales.y(i) + configuration.lineHeight})`
            )
            .append('line')
            .attr('x1', 0)
            .attr(
                'x2',
                dimensions.width -
                    (configuration.labelsWidth +
                        configuration.labelsRightMargin)
            );

        separators.exit().remove();
    };
