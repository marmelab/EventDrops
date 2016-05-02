describe('Drops drawer', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
    });

    it('should add click handler if specified in configuration', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const clickSpy = jasmine.createSpy();
        const chart = d3.chart.eventDrops().eventClick(clickSpy);
        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');

        const event = document.createEvent('UIEvents');
        event.initUIEvent('click', true, true, null, null);
        drop.node().dispatchEvent(event);

        expect(clickSpy.calls.any()).toBe(true);
    });

    it('should add hover handler if specified in configuration', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const hoverSpy = jasmine.createSpy();
        const chart = d3.chart.eventDrops().eventHover(hoverSpy);
        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');

        const event = document.createEvent('UIEvents');
        event.initUIEvent('mouseover', true, true, null, null);
        drop.node().dispatchEvent(event);

        expect(hoverSpy.calls.any()).toBe(true);
    });

    it('should set `cx` attribute to given scale `x`', () => {
        const data = [{ name: 'foo', data: [new Date('2014-04-03')] }];

        const chart = d3.chart.eventDrops()
            .start(new Date('2014-04-02'))
            .end(new Date('2014-04-04'));

        d3.select(wrapper).datum(data).call(chart);

        const drop = d3.select('.drop');
        expect(+drop.attr('cx')).toBe(375);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
    });
});
