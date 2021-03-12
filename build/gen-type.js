/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// index.d.ts
const newIndexPath = path.resolve(__dirname, '../lib/index.d.ts');
fs.copyFileSync(path.resolve(__dirname, '../lib/common-util/index.d.ts'), newIndexPath);
const index = fs.readFileSync(newIndexPath);
const newIndex = index.toString().replace(/@common-util\//g, './');
fs.writeFileSync(newIndexPath, newIndex);

// remove
fs.rmdirSync(path.resolve(__dirname, '../lib/common-util'), { recursive: true });

// remove test-utils
fs.rmdirSync(path.resolve(__dirname, '../lib/test-utils'), { recursive: true });

// component
const libDirPath = path.resolve(__dirname, '../lib');
fs.readdirSync(libDirPath).forEach(comp => {
    if(!/utils/.test(comp)) {
        if (fs.lstatSync(path.resolve(libDirPath, comp)).isDirectory()) {
            // re-import
            const imp = fs.readFileSync(path.resolve(libDirPath, comp, 'index.d.ts')).toString();
            if(imp.includes('@common-util/')) {
                const newImp = imp.replace('@common-util/', '../');
                fs.writeFileSync(path.resolve(libDirPath, comp, 'index.d.ts'), newImp);
            }
        }
    }
});

// after components dir renamed
fs.readdirSync(libDirPath).forEach(comp => {
    // check src/*.d.ts exist
    const srcPath = path.resolve(libDirPath, comp, './src');
    if (fs.existsSync(srcPath)) {
        if (fs.lstatSync(srcPath).isDirectory()) {
            fs.readdir(srcPath, 'utf-8', (err, data) => {
                if (err) return;
                // replace all @common-util in src/*.d.ts
                data.forEach(f => {
                    if (!fs.lstatSync(path.resolve(srcPath, f)).isDirectory()) {
                        const imp = fs.readFileSync(path.resolve(srcPath, f)).toString();
                        if (imp.includes('@common-util/')) {
                            const newImp = imp.replace(/@common-util\//g, '../../');
                            fs.writeFileSync(path.resolve(srcPath, f), newImp);
                        }
                    }
                });
            });
        }
    }
});
