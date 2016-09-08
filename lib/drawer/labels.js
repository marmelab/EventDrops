import filterData from '../filterData';

export default (container, scales, config) => data => {
    const labels = container.selectAll('.label').data(data);

    const text = d => {
        const count = filterData(d.data, scales.x, config.date).length;
        return d.name + (count > 0 ? ` (${count})` : '');
    };

    labels.text(text);

    labels.enter()
        .append('text')
            .classed('label', true)
            .attr('x', config.labelsWidth)
            .attr('transform', (d, idx) => `translate(0, ${40 + scales.y(idx)})`)
            .attr('text-anchor', 'end')
            .text(text);

    labels.exit().remove();
};
