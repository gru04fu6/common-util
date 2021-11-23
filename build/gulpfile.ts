import { series, parallel } from 'gulp';
import { run } from './utils/process';
import { withTaskName } from './utils/gulp';
import { buildOutput } from './utils/paths';
import { buildConfig } from './build-info';
import type { TaskFunction } from 'gulp';
import type { Module } from './build-info';

const runTask = (name: string) =>
    withTaskName(name, () => run(`pnpm run build ${name}`));

export const copyTypesDefinitions: TaskFunction = done => {
    const src = `${buildOutput}/types/`;
    const copy = (module: Module) =>
        withTaskName(`copyTypes:${module}`, () =>
            run(`rsync -a ${src} ${buildConfig[module].output.path}/`)
        );

    return parallel(copy('esm'), copy('cjs'))(done);
};

export default series(
    withTaskName('clean', () => run('pnpm run clean:lib')),

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
