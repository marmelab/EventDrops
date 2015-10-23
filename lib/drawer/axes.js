import { drawYAxis } from './yAxis';
import { drawTopAxis, drawBottomAxis } from './xAxis';

const boolOrReturnValue = (x, data) => typeof x === 'function' ? x(data) : x;

export const axes = (svg, scales, configuration, dimensions) => (
    (data) => {
        if (boolOrReturnValue(configuration.hasTopAxis, data)) {
            drawTopAxis(svg, scales.x, configuration, dimensions);
        }

        if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
            drawBottomAxis(svg, scales.x, configuration, dimensions);
        }

        drawYAxis(svg, scales.y, configuration, dimensions);
    }
);
