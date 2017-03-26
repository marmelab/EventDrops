import eventDrops from '../../../src';


describe('Drops drawer', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = document.createElement('div');
        wrapper.style.width = '100px';
        document.body.appendChild(wrapper);
    });

    it('should add click handler if specified in configuration', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const clickSpy = jasmine.createSpy();
        const chart = eventDrops().click(clickSpy);
        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');

        const event = document.createEvent('UIEvents');
        event.initUIEvent('click', true, true, null, null);
        drop.node().dispatchEvent(event);

        expect(clickSpy.calls.any()).toBe(true);
    });

    it('should add hover handler if specified in configuration', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const mouseoverSpy = jasmine.createSpy();
        const chart = eventDrops().mouseover(mouseoverSpy);
        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');

        const event = document.createEvent('UIEvents');
        event.initUIEvent('mouseover', true, true, null, null);
        drop.node().dispatchEvent(event);

        expect(mouseoverSpy.calls.any()).toBe(true);
    });

    it('should call `mouseout` handler when leaving a drop', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const mouseoutSpy = jasmine.createSpy();
        const chart = eventDrops().mouseout(mouseoutSpy);
        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');

        const event = document.createEvent('UIEvents');
        event.initUIEvent('mouseout', true, true, null, null);
        drop.node().dispatchEvent(event);

        expect(mouseoutSpy.calls.any()).toBe(true);
    });

    it('should set `cx` attribute to given scale `x`', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const chart = eventDrops()
            .start(new Date('2014-04-02'))
            .end(new Date('2014-04-04'));

        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');
        expect(+drop.attr('cx')).toBe(-60);
    });

    describe('.drop-line', () => {
        it('should set correct width based on given scale', () => {
            const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

            const chart = eventDrops()
                .labelsWidth(0)
                .labelsRightMargin(0)
                .start(new Date('2014-04-02'))
                .end(new Date('2014-04-04'));

            d3.select(wrapper).datum(data).call(chart);

            const dropLine = d3.select('.drop-line');
            expect(+dropLine.attr('width')).toBe(100);
        });

        it('should position each line at correct vertical position depending of current serie', () => {
            const data = [
                { name: 'foo', data: [new Date('2014-04-03')] },
                { name: 'bar', data: [new Date('2014-05-03')] },
                { name: 'quz', data: [new Date('2014-06-03')] },
            ];

            const chart = eventDrops()
                .start(new Date('2014-04-02'))
                .end(new Date('2014-04-04'));

            d3.select(wrapper).datum(data).call(chart);

            const dropLines = document.querySelectorAll('.drop-line');
            const topTranslate = [...dropLines].map(
                dropLine =>
                    dropLine
                        .getAttribute('transform')
                        .split(',')
                        .pop()
                        .split(')')[0]
            );

            expect(topTranslate.map(t => +t)).toEqual([0, 40, 80]);
        });
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
    });
});
