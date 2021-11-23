import { resolve } from 'path';

export const projRoot = resolve(__dirname, '..', '..');
export const pkgRoot = resolve(projRoot, 'packages');
export const cuRoot = resolve(pkgRoot, 'common-util');
export const utilRoot = resolve(pkgRoot, 'utils');

/** dist */
export const buildOutput = resolve(projRoot, 'dist');
/** dist */
export const cuOutput = resolve(buildOutput);

export const projPackage = resolve(projRoot, 'package.json');
export const cuPackage = resolve(cuRoot, 'package.json');
export const utilPackage = resolve(utilRoot, 'package.json');
