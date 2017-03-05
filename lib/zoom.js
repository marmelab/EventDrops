import * as d3 from 'd3/build/d3';
import xAxis from './xAxis';

export default (container, dimensions, scales, configuration, data, callback) => {
    const onZoom = (data,index,element) => {
            const scalingFunction = d3.event.transform.rescaleX(scales.x);
            const selector = container.selectAll('.x-axis.top')
                .call(d3.axisTop().scale(scalingFunction));
            
            requestAnimationFrame(() =>{
                
                const drops = container.selectAll('.drop-line')
                    .selectAll('.drop')
                    .attr('cx',(d,i) => {
                        return scalingFunction(new Date(d.date))
                })

                if(callback){
                    callback(data);
                }
            })
    };

    const zoom = d3.zoom()
        .scaleExtent([configuration.minScale, configuration.maxScale])
        .on('zoom', onZoom)
        .on('end', configuration.zoomend);
    
   container.call(zoom);
    return zoom;
};
