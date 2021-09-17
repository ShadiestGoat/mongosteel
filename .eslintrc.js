module.exports = {
    "parser": "@typescript-eslint/parser",
    "extends": [
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/ban-tslint-comment": "error"
    },
    "ignorePatterns": [
        "dist/",
        "build/"
    ]
}

