import filterData from '../filterData';

export const labels = (container, scales, config) => data => {
    const labelsContainer = container
        .append('g')
        .classed('labels', true)
        .attr('transform', 'translate(0, 45)');

    const labels = labelsContainer.selectAll('.label').data(data);

    labels.enter()
        .append('text')
            .classed('label', true)
            .attr('x', 180)
            .attr('transform', (d, idx) => `translate(0, ${scales.y(idx)})`)
            .attr('text-anchor', 'end')
            .text(d => {
                const count = filterData(d.dates, scales.x).length;
                return d.name + (count > 0 ? ` (${count})` : '');
            });

    labels.exit().remove();
};
