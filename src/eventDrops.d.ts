export type funcOrString = string | ((d: any, index?: number) => string);
export type funcOrDate = Date | ((d: any, index?: number) => Date);
export type funcOrNumber = number | ((d: any, index?: number) => number);

export interface ConfigInterface {
    locale: d3.TimeLocaleDefinition,
    metaballs: {
        blurDeviation: number,
        colorMatrix: string,
    },
    bound: {
        format: (date: Date) => string,
    },
    axis: {
        formats: {
            milliseconds: string,
            seconds: string,
            minutes: string,
            hours: string,
            days: string,
            weeks: string,
            months: string,
            year: string,
        }
    },
    drops: (row: any) => any,
    drop: {
        color: funcOrString,
        radius: funcOrNumber,
        date: funcOrDate,
        onClick: () => void,
        onMouseOver: () => void,
        onMouseOut: () => void,
    },
    label: {
        padding: funcOrNumber,
        text: funcOrString,
        width: funcOrNumber,
    },
    line: {
        color: funcOrString,
        height: funcOrNumber,
    },
    margin: {
        top: number,
        right: number,
        left: number,
        bottom: number,
    },
    range: {
        start: Date,
        end: Date,
    },
    zoom: {
        onZoomStart: () => void,
        onZoom: () => void,
        onZoomEnd: () => void,
        minimumScale: number,
        maximumScale: number,
    },
}
