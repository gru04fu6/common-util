const OFF = 'off';
const ERROR = 'error';
const WARNING = 'warn';

module.exports = {
    env: {
        browser: true,
        node: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            tsx: true
        }
    },
    extends: [
        'eslint:recommended',
        'plugin:import/typescript'
    ],
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        'arrow-body-style': [ERROR, 'as-needed'],
        'arrow-parens': [ERROR, 'as-needed'],
        'comma-dangle': [ERROR, 'never'],
        'class-methods-use-this': OFF,
        'global-require': OFF,
        'lines-between-class-members': [
            ERROR,
            'always',
            { exceptAfterSingleLine: true }
        ],
        'max-len': OFF,
        'no-bitwise': [ERROR, { allow: ['~'] }],
        'no-console': process.env.NODE_ENV === 'production' ? ERROR : OFF,
        'no-debugger': process.env.NODE_ENV === 'production' ? ERROR : OFF,
        'no-param-reassign': [
            ERROR,
            {
                props: false
            }
        ],
        'no-restricted-syntax': [
            ERROR,
            'ForInStatement',
            'LabeledStatement',
            'WithStatement'
        ],
        'object-shorthand': WARNING,
        quotes: [ERROR, 'single'],
        semi: ERROR,
        'no-underscore-dangle': OFF,

        // ------------------- import plugin -------------------
        'import/extensions': [
            ERROR,
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
                js: 'never',
                jsx: 'never'
            }
        ],
        'import/prefer-default-export': WARNING,
        'import/no-dynamic-require': OFF,
        'import/no-extraneous-dependencies': OFF,
        // -----------------------------------------------------

        // ----- 關掉eslint的設定，改用typescript-eslint的設定 -----
        indent: OFF,
        'no-unused-vars': OFF,
        camelcase: OFF,
        'no-dupe-class-members': OFF,
        'no-shadow': OFF,
        'no-use-before-define': OFF,

        '@typescript-eslint/indent': [
            ERROR,
            4,
            {
                SwitchCase: 1,
                MemberExpression: 1
            }
        ],
        '@typescript-eslint/no-unused-vars': [ERROR, { args: 'after-used' }],
        '@typescript-eslint/naming-convention': [
            ERROR,
            { selector: 'property', format: null }
        ],
        '@typescript-eslint/no-dupe-class-members': ERROR,
        '@typescript-eslint/no-shadow': ERROR,
        '@typescript-eslint/no-use-before-define': [
            ERROR,
            { ignoreTypeReferences: true, typedefs: false, functions: false }
        ],
        // -----------------------------------------------------

        // -----------------------關掉設定-----------------------
        'no-alert': OFF,
        'no-mixed-operators': OFF,
        '@typescript-eslint/no-explicit-any': OFF,
        '@typescript-eslint/no-this-alias': OFF,
        '@typescript-eslint/no-non-null-assertion': OFF,
        '@typescript-eslint/explicit-module-boundary-types': OFF
        // -----------------------------------------------------
    }
};