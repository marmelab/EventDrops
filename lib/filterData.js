export default function filterData(data = [], scale) {
    const boundary = scale.range();
    const [min, max] = boundary;

    return data.filter(d => {
        const value = scale(d);
        return value >= min || value <= max;
    });
}
