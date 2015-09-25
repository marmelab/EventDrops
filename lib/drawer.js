import d3 from 'd3';
import delimiter from './delimiter';
import eventLine from './eventLine';
import xAxis from './xAxis';

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

        const viewport = this._svg.append('g')
            .attr('transform', 'translate(0, 25)');

        this._graph = viewport.append('g')
            .classed('graph-body', true)
            .attr('transform', `translate(${this._configuration.margin.left}, ${this._configuration.margin.top - 15})`);

        this.initDelimiters();
        this.metaballize();
    }

    metaballize() {
        const defs = this._svg.append('defs');

        const filter = defs.append('filter').attr('id', 'metaball');

        filter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', 10)
            .attr('result', 'blur');

        filter.append('feColorMatrix')
            .attr('in', 'blur')
            .attr('mode', 'matrix')
            .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 80 -7')
            .attr('result', 'contrast');

        filter.append('feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'contrast');
    }

    draw(data) {
        this.drawAxes(data);
        this.drawLines(data);
        this.drawDelimiters();
    }

    drawAxes(data) {
        this.drawYAxis();
        this.drawXAxes(data);
    }

    drawLines(data) {
        const lines = this._graph.selectAll('g').data(data);

        lines.enter()
            .append('g')
            .classed('line', true)
            .attr('transform', (d) => `translate(0, ${this._scales.y(d.name)})`)
            .style('fill', this._configuration.eventLineColor)
            .call(eventLine({
                xScale: this._scales.x,
                eventColor: this._configuration.eventColor,
            }));

        lines.exit().remove();

        lines.call(eventLine({
            xScale: this._scales.x,
            eventColor: this._configuration.eventColor,
        }));
    }

    drawYAxis() {
        const yAxis = this._svg.append('g')
            .classed('y-axis', true)
            .attr('transform', 'translate(0, 60)');

        const yTick = yAxis.append('g').selectAll('g').data(this._scales.y.domain());

        yTick.enter()
            .append('g')
            .attr('transform', (d) => `translate(0, ${this._scales.y(d)})`)
            .append('line')
            .classed('y-tick', true)
            .attr('x1', this._configuration.margin.left)
            .attr('x2', this._configuration.margin.left + this._dimensions.width);

        yTick.exit().remove();
    }

    drawXAxes(data) {
        const axes = {};

        ['top', 'bottom'].forEach((where) => {
            const uppercasedWhere = where.slice(0, 1).toUpperCase() + where.slice(1);
            const parameterName = `has${uppercasedWhere}Axis`;
            const hasAxis = typeof this._configuration[parameterName] === 'function' ? this._configuration[parameterName](data) : this._configuration[parameterName];

            if (hasAxis) {
                axes[where] = xAxis(this._scales.x, this._configuration, where);
            }
        });

        for (const where in axes) {
            if (!axes.hasOwnProperty(where)) {
                continue;
            }

            const y = (where === 'bottom' ? parseInt(this._dimensions.height, 10) : 0) + this._configuration.margin.top - 40;

            this._graph.append('g')
                .classed('x-axis', true)
                .classed(where, true)
                .attr('transform', `translate(${this._configuration.margin.left}, ${y})`)
                .call(axes[where]);
        }
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
