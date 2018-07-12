import { getBreakpointLabel } from './breakpoint';

const defaultConfig = {
    breakpoints: {
        small: 576,
        medium: 768,
        large: 992,
        extra: 1200,
    },
};

describe('Breakpoint Label', () => {
    it('should return breakpoint label correctly depending of current point', () => {
        expect(getBreakpointLabel(defaultConfig.breakpoints, 400)).toBe(
            'small'
        );
        expect(getBreakpointLabel(defaultConfig.breakpoints, 600)).toBe(
            'medium'
        );
        expect(getBreakpointLabel(defaultConfig.breakpoints, 800)).toBe(
            'large'
        );
        expect(getBreakpointLabel(defaultConfig.breakpoints, 1000)).toBe(
            'extra'
        );
    });
});
