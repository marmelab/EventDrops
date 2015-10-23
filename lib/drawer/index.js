import d3 from 'd3';
// import delimiter from './delimiter';
import { axes } from './axes';
import { line } from './line';

export default (rootElement, dimensions, scales, configuration) => {
    rootElement.select('svg').remove();

    const svg = rootElement.append('svg').attr({
        width: dimensions.width,
        height: dimensions.outer_height
    });

    return (data) => {
        line(svg, scales.x, scales.y, data, 'red');
        axes(svg, scales, configuration, dimensions)(data);

        return svg;
    };

    // this.initDelimiters();
    // this.metaballize();
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
