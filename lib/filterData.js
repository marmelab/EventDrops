export default function filterData(data = [], scale) {
    const [min, max] = scale.domain();
    return data.filter(d => d >= min && d <= max);
}
