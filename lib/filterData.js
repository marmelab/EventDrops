export default function filterData(data = [], scale) {
    const [min, max] = scale.domain();
    return data.filter(d => {
        return d >= min && d <= max;
    });
}
