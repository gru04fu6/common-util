import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import replace from '@rollup/plugin-replace';
import filesize from 'rollup-plugin-filesize';
import { parallel } from 'gulp';
import { cuRoot, cuOutput } from './utils/paths';
import { generateExternal, writeBundles } from './utils/rollup';

import { withTaskName } from './utils/gulp';

export const buildFull = (minify: boolean) => async () => {
    const bundle = await rollup({
        input: path.resolve(cuRoot, 'index.ts'),
        plugins: [
            nodeResolve({
                extensions: ['.mjs', '.js', '.json', '.ts']
            }),
            commonjs(),
            esbuild({
                minify,
                sourceMap: minify,
                target: 'es2018'
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),

                // options
                preventAssignment: true
            }),
            filesize()
        ],
        external: await generateExternal({ full: true })
    });
    await writeBundles(bundle, [
        {
            format: 'umd',
            file: path.resolve(cuOutput, `index.full${minify ? '.min' : ''}.js`),
            exports: 'named',
            name: 'CommonUtil',
            sourcemap: minify
        },
        {
            format: 'esm',
            file: path.resolve(
                cuOutput,
                `index.full${minify ? '.min' : ''}.mjs`
            ),
            sourcemap: minify
        }
    ]);
};

export const buildFullBundle = parallel(
    withTaskName('buildFullMinified', buildFull(true)),
    withTaskName('buildFull', buildFull(false))
);
