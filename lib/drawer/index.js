import d3 from 'd3';
import { axes } from './axes';
import { drops } from './drops';
import { labels } from './labels';
import filterData from '../filterData';

export default (svg, dimensions, scales, configuration) => {
    const clipRectangle = svg => svg.append('defs')
        .append('svg:clipPath')
        .attr('id', 'drops-container')
            .append('svg:rect')
            .attr('id', 'drops-container-rect')
            .attr('x', configuration.margin.left + 10)
            .attr('y', 0)
            .attr('width', dimensions.width)
            .attr('height', dimensions.outer_height);

    const draw = (data) => {
        clipRectangle(svg, dimensions);

        labels(svg, scales, configuration)(data);
        axes(svg, scales, configuration, dimensions)(data);

        const dropContainer = svg.append('g')
            .classed('drops-container', true);

        drops(dropContainer, scales, configuration)(data); //zoomableArea, scales.x, scales.y, data, 'red');
    };

    // this.initDelimiters();
    // this.metaballize();

    const redraw = (data) => {
        d3.selectAll('.drop').remove(); // @FIXME: it should be done directly by the drop.exit().remove() in drawer/drops
        drops(svg, scales, configuration)(data);
    };

    return { draw, redraw };
};

//
// metaballize() {
//     const defs = svg.append('defs');
//
//     const filter = defs.append('filter').attr('id', 'metaball');
//
//     filter.append('feGaussianBlur')
//         .attr('in', 'SourceGraphic')
//         .attr('stdDeviation', 10)
//         .attr('result', 'blur');
//
//     filter.append('feColorMatrix')
//         .attr('in', 'blur')
//         .attr('mode', 'matrix')
//         .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 80 -7')
//         .attr('result', 'contrast');
//
//     filter.append('feBlend')
//         .attr('in', 'SourceGraphic')
//         .attr('in2', 'contrast');
// }

// initDelimiters() {
//     this._delimiters = this._svg.append('g')
//         .classed('delimiter', true)
//         .attr('width', this._dimensions.width)
//         .attr('height', 10)
//         .attr('transform', `translate(${this._configuration.margin.left}, ${this._configuration.margin.top - 45})`);
// }

// drawDelimiters() {
//     this._delimiters.call(delimiter({
//         xScale: this._scales.x,
//         dateFormat: this._configuration.locale ? this._configuration.locale.timeFormat('%d %B %Y') : d3.time.format('%d %B %Y'),
//     }));
// }
