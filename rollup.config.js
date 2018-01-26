import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

export default {
    entry: 'src/index.js',
    format: 'umd',
    moduleName: 'eventDrops',
    plugins: [
        json(),
        css({ output: 'dist/style.css' }),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules',
            },
        }),
        babel({
            exclude: 'node_modules/**',
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        uglify(),
    ],
    external: ['d3'],
    dest: 'dist/index.js',
    sourceMap: true,
};
