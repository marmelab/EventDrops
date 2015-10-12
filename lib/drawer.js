import d3 from 'd3';
import delimiter from './delimiter';
import { line } from './drawers/line';
import { drawYAxis } from './drawers/yAxis';
import { drawTopAxis, drawBottomAxis } from './drawers/xAxis';

class Drawer {
    constructor(rootElement, dimensions, scales, configuration) {
        this._rootElement = rootElement;
        this._dimensions = dimensions;
        this._scales = scales;
        this._configuration = configuration;
    }

    initSvg() {
        this._rootElement.select('svg').remove();
        this._svg = this._rootElement.append('svg')
            .attr('width',  this._dimensions.width)
            .attr('height', this._dimensions.outer_height);

        // this.initDelimiters();
        // this.metaballize();
    }
    //
    // metaballize() {
    //     const defs = this._svg.append('defs');
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

    draw(data) {
        line(this._svg, this._scales.x, this._scales.y, data, 'red');
        this.drawAxes(data);
        // this.drawDelimiters();
    }

    drawAxes(data) {
        const hasTopAxis = typeof this._configuration.hasTopAxis === 'function' ? this._configuration.hasTopAxis(data) : this._configuration.hasTopAxis;
        if (hasTopAxis) {
            drawTopAxis(this._svg, this._scales.x, this._configuration, this._dimensions);
        }

        const hasBottomAxis = typeof this._configuration.hasBottomAxis === 'function' ? this._configuration.hasBottomAxis(data) : this._configuration.hasBottomAxis;
        if (hasBottomAxis) {
            drawBottomAxis(this._svg, this._scales.x, this._configuration, this._dimensions);
        }

        drawYAxis(this._svg, this._scales.y, this._configuration, this._dimensions);
    }

    initDelimiters() {
        this._delimiters = this._svg.append('g')
            .classed('delimiter', true)
            .attr('width', this._dimensions.width)
            .attr('height', 10)
            .attr('transform', `translate(${this._configuration.margin.left}, ${this._configuration.margin.top - 45})`);
    }

    drawDelimiters() {
        this._delimiters.call(delimiter({
            xScale: this._scales.x,
            dateFormat: this._configuration.locale ? this._configuration.locale.timeFormat('%d %B %Y') : d3.time.format('%d %B %Y'),
        }));
    }

    get svg() { return this._svg; }
}

export default Drawer;
