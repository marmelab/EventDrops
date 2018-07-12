export const getBreakpointLabel = (breakpoints, point) => {
    for (const label in breakpoints) {
        if (point <= breakpoints[label]) {
            return label;
        }
    }

    return 'extra';
};
