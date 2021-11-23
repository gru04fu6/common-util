module.exports = {
    globals: {
    // work around: https://github.com/kulshekhar/ts-jest/issues/748#issuecomment-423528659
        'ts-jest': {
            diagnostics: {
                ignoreCodes: [151001]
            }
        }
    },
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/node_modules/', 'dist'],
    modulePathIgnorePatterns: ['/node_modules/', 'dist'],
    transform: {
        '\\.(j|t)s$': '@sucrase/jest-plugin',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    // u can change this option to a more specific folder for test single component or util when dev
    // for example, ['<rootDir>/packages/input']
    roots: ['<rootDir>']
};
