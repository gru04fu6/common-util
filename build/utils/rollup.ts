import { cuPackage } from './paths';
import { getPackageDependencies } from './pkg';

import type { OutputOptions, RollupBuild } from 'rollup';

export const generateExternal = async (options: { full: boolean }) => (id: string) => {
    const packages: string[] = [];
    if (!options.full) {
        // dependencies
        packages.push(...getPackageDependencies(cuPackage));
    }

    return [...new Set(packages)].some(
        pkg => id === pkg || id.startsWith(`${pkg}/`)
    );
};

export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
    return Promise.all(options.map(option => bundle.write(option)));
}
