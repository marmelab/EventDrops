import filterData from '../filterData';

export default (container, scales, config) =>
    data => {
        const result = [];
        if(!config.displayLabels) {
            if(data && !data.length){
                return;
            }
            data.forEach( d => {
                const count = filterData(d.data, scales.x, config.date).length;
                result.push({name: d.name,count: count});    
            })
            
            return result;
        }

        let labels;
        if(data){
            labels = container.selectAll('.label').data(data);
        }
        else {
            labels = container.selectAll('.label');   
        }

        const text = d => {
            const count = filterData(d.data, scales.x, config.date).length;
            result.push({name: d.name,count: count});
            return d.name + (count > 0 ? ` (${count})` : '');
        };

        labels.text(text);

        labels
            .enter()
            .append('text')
            .classed('label', true)
            .attr('x', config.labelsWidth)
            .attr(
                'transform',
                (d, idx) => `translate(0, ${40 + scales.y(idx)})`
            )
            .attr('text-anchor', 'end')
            .text(text);

        labels.exit().remove();
        return result;
    };
