import { lineSeparatorFactory } from './lines/lineSeparator';
import { labelFactory } from './lines/label';
import { dropsAreaFactory } from './lines/dropsArea';

export default (chart, config) => {
    const {
        metaballs,
        label: { text: labelText, padding: labelPadding, width: labelWidth },
        line: { color: lineColor, height: lineHeight },
        indicator: indicatorEnabled,
    } = config;

    return function(viewport) {
        const lines = viewport.selectAll('.drop-line').data(d => d, d => d.sha);

        lines.exit().remove();

        const enteringLines = lines.enter();

        const enteringDropLine = enteringLines
            .append('g')
            .classed('drop-line', true)
            .attr('fill', lineColor)
            .attr(
                'transform',
                (_, index) => `translate(${labelWidth}, ${index * lineHeight})`
            );

        enteringDropLine
            .merge(lines)
            .each(lineSeparatorFactory(config))
            .each(labelFactory(config))
            .each(dropsAreaFactory(config, chart.scale));
    };
};
