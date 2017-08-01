import { onRequestAnimationFrameFactory } from '../../src/zoom';

describe('Zoom', () => {
    it('should rescale using custom date using configuration.date function', () => {
        const configuration = {
            date: d => d.customDate,
        };

        const div = document.createElement('div');
        div.innerHTML = `
            <div class="drop-line">
                <div class="drop"></div>
            </div>
        `;

        const data = [{ id: 1, customDate: '2017-01-12' }];
        const container = d3.select(div);

        const drops = container.selectAll('.drop').data(data);

        const scalingFunction = x => x;
        onRequestAnimationFrameFactory(
            container,
            configuration,
            () => {},
            () => {},
            scalingFunction,
            data
        )();

        // .attr getter returns result of function with first non null data specified
        // @see http://devdocs.io/d3~4/d3-selection#selection_attr
        expect(drops.attr('cx')).toBe('2017-01-12');
    });
});
