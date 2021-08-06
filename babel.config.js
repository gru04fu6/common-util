module.exports = {
    // ATTENTION!!
    // Preset ordering is reversed, so `@babel/typescript` will called first
    // Do not put `@babel/typescript` before `@babel/env`, otherwise will cause a compile error
    // See https://github.com/babel/babel/issues/12066
    presets: [
        [
            '@babel/env',
            {
                loose: true,
                modules: false
            }
        ],
        '@babel/typescript'
    ],
    plugins: [
        '@babel/transform-runtime',
        'lodash',
        ['@babel/plugin-proposal-class-properties', { 'loose': false }],
        ['@babel/plugin-proposal-private-methods', { 'loose': false }],
        ['@babel/plugin-proposal-private-property-in-object', { 'loose': false }]
    ],
    env: {
        utils: {
            ignore: [
                '**/*.test.ts',
                '**/*.spec.ts'
            ],
            presets: [
                [
                    '@babel/env',
                    {
                        loose: true,
                        modules: false
                    }
                ]
            ],
            plugins: [
                [
                    'babel-plugin-module-resolver',
                    {
                        root: ['common-util'],
                        alias: {
                            '@common-util': 'common-util/lib'
                        }
                    }
                ]
            ]
        }
    }
};
