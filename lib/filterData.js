export default function filterData(data = [], scale, config) {
    const [min, max] = scale.domain();
    return data.filter(d => config.date(d) >= min && config.date(d) <= max);
}
