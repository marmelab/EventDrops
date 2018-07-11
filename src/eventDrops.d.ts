import { timeSaturday } from "d3";

export type funcOrString = string | ((d: any, index?: number) => string);
export type funcOrDate = Date | ((d: any, index?: number) => Date);
export type funcOrNumber = number | ((d: any, index?: number) => number);

export interface ConfigInterface {
    d3: any,
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
        date: (d: any, index?: number) => Date,
        onClick: () => void,
        onMouseOver: () => void,
        onMouseOut: () => void,
    },
    label: {
        padding: funcOrNumber,
        text: funcOrString,
        width: number,
    },
    line: {
        color: funcOrString,
        height: number,
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

export type timeScale = d3.ScaleTime<number, number>;

export type anySelection = d3.Selection<any, any, any, any>;

export interface EventDropsInterface {
    draw: (anySelection) => void,
    scale: (anySelection) => timeScale
    width: (anySelection) => number,
    visibleData: (anySelection) => any[],
}
