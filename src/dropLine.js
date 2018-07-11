import drop from './drop';
import indicator from './indicator';

export default (config, xScale) => selection => {
    const {
        metaballs,
        label: { text: labelText, padding: labelPadding, width: labelWidth },
        line: { color: lineColor, height: lineHeight },
        indicator,
    } = config;

    const lines = selection.selectAll('.drop-line').data(d => d);

    const g = lines
        .enter()
        .append('g')
        .classed('drop-line', true)
        .attr('fill', lineColor)
        .attr('transform', (_, index) => `translate(0, ${index * lineHeight})`);

    g
        .append('line')
        .classed('line-separator', true)
        .attr('x1', labelWidth)
        .attr('x2', '100%')
        .attr('y1', () => lineHeight)
        .attr('y2', () => lineHeight);

    const drops = g
        .append('g')
        .classed('drops', true)
        .attr('transform', () => `translate(${labelWidth}, ${lineHeight / 2})`)
        .call(drop(config, xScale));

    drops
        .append('rect') // The rect allow us to size the drops g element
        .attr('x', 0)
        .attr('y', -config.line.height / 2)
        .attr('width', 1) // For the rect to impact its parent size it must have a non zero width
        .attr('height', config.line.height)
        .attr('fill', 'transparent');

    if (metaballs) {
        drops.style('filter', 'url(#metaballs)');
    }

    g
        .append('text')
        .classed('line-label', true)
        .attr('x', labelWidth - labelPadding)
        .attr('y', lineHeight / 2)
        .attr('dy', '0.25em')
        .attr('text-anchor', 'end')
        .text(labelText);

    lines.selectAll('.line-label').text(labelText);
    lines.selectAll('.drops').call(drop(config, xScale));

    if (indicator) {
        g
            .append('g')
            .classed('indicators', true)
            .call(indicator(config, xScale));

        lines.selectAll('.indicators').call(indicator(config, xScale));
    }

    lines.exit().remove();
};
