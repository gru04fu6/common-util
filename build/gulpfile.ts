import path from 'path';
import { series, parallel } from 'gulp';
import { mkdir } from 'fs/promises';
import { copy } from 'fs-extra';
import { run } from './utils/process';
import { withTaskName } from './utils/gulp';
import { buildOutput, cuOutput } from './utils/paths';
import { buildConfig } from './build-info';
import type { TaskFunction } from 'gulp';
import type { Module } from './build-info';

const runTask = (name: string) =>
    withTaskName(name, () => run(`pnpm run build ${name}`));

export const copyTypesDefinitions: TaskFunction = done => {
    const src = path.resolve(buildOutput, 'types');
    const copyTypes = (module: Module) =>
        withTaskName(`copyTypes:${module}`, () =>
            copy(src, buildConfig[module].output.path, { recursive: true })
        );

    return parallel(copyTypes('esm'), copyTypes('cjs'))(done);
};

export default series(
    withTaskName('clean', () => run('pnpm run clean')),
    withTaskName('createOutput', () => mkdir(cuOutput, { recursive: true })),

    parallel(
        runTask('buildModules'),
        runTask('buildFullBundle'),
        runTask('generateTypesDefinitions')
    ),

    parallel(copyTypesDefinitions)
);

export * from './types-definitions';
export * from './modules';
export * from './full-bundle';
