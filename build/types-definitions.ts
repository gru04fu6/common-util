import path from 'path';
import fs from 'fs/promises';
import { Project } from 'ts-morph';
import glob from 'fast-glob';
import { bold } from 'chalk';

import { green, red, yellow } from './utils/log';
import { buildOutput, cuRoot, pkgRoot, projRoot } from './utils/paths';

import { excludeFiles, pathRewriter } from './utils/pkg';
import type { SourceFile } from 'ts-morph';

const TSCONFIG_PATH = path.resolve(projRoot, 'tsconfig.json');
const outDir = path.resolve(buildOutput, 'types');

/**
 * fork = require( https://github.com/egoist/vue-dts-gen/blob/main/src/index.ts
 */
export const generateTypesDefinitions = async () => {
    const project = new Project({
        compilerOptions: {
            allowJs: true,
            declaration: true,
            emitDeclarationOnly: true,
            noEmitOnError: false,
            outDir,
            baseUrl: projRoot,
            paths: {
                '@common-util/*': ['packages/*']
            },
            skipLibCheck: true
        },
        tsConfigFilePath: TSCONFIG_PATH,
        skipAddingFilesFromTsConfig: true
    });

    const filePaths = excludeFiles(
        await glob(['**/*.{js,ts}', '!common-util/**/*'], {
            cwd: pkgRoot,
            absolute: true,
            onlyFiles: true
        })
    );
    const epPaths = excludeFiles(
        await glob('**/*.{js,ts}', {
            cwd: cuRoot,
            onlyFiles: true
        })
    );

    const sourceFiles: SourceFile[] = [];
    await Promise.all([
        ...filePaths.map(async file => {
            const sourceFile = project.addSourceFileAtPath(file);
            sourceFiles.push(sourceFile);
        }),
        ...epPaths.map(async file => {
            const content = await fs.readFile(path.resolve(cuRoot, file), 'utf-8');
            sourceFiles.push(
                project.createSourceFile(path.resolve(pkgRoot, file), content)
            );
        })
    ]);

    const diagnostics = project.getPreEmitDiagnostics();
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

    await project.emit({
        emitOnlyDtsFiles: true
    });

    const tasks = sourceFiles.map(async sourceFile => {
        const relativePath = path.relative(pkgRoot, sourceFile.getFilePath());
        yellow(`Generating definition for file: ${bold(relativePath)}`);

        const emitOutput = sourceFile.getEmitOutput();
        const emitFiles = emitOutput.getOutputFiles();
        if (emitFiles.length === 0) {
            red(`Emit no file: ${bold(relativePath)}`);
            return;
        }

        const subTasks = emitFiles.map(async outputFile => {
            const filepath = outputFile.getFilePath();
            await fs.mkdir(path.dirname(filepath), {
                recursive: true
            });

            await fs.writeFile(
                filepath,
                pathRewriter('esm')(outputFile.getText()),
                'utf8'
            );

            green(`Definition for file: ${bold(relativePath)} generated`);
        });

        await Promise.all(subTasks);
    });

    await Promise.all(tasks);
};
