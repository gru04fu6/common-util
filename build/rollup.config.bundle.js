import { nodeResolve } from '@rollup/plugin-node-resolve';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from '../package.json';
const deps = Object.keys(pkg.dependencies);

export default [
    {
        input: path.resolve(__dirname, '../packages/common-util/index.ts'),
        output: {
            format: 'es',
            file: 'lib/index.esm.js'
        },
        plugins: [
            terser(),
            nodeResolve(),
            typescript({
                tsconfigOverride: {
                    'include': [
                        'packages/**/*'
                    ],
                    'exclude': [
                        'node_modules',
                        'packages/**/__tests__/*'
                    ]
                },
                abortOnError: false
            })
        ],
        external(id) {
            return deps.some(k => new RegExp('^' + k).test(id));
        }
    }
];
