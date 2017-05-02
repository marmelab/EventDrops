export default function filterData(data = [], scale, date) {
    const [min, max] = scale.domain();
    return data.filter(d => date(d) >= min && date(d) <= max);
}
