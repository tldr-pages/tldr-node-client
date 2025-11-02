export default [
    {
      "files": ["bin/tldr"],
      "rules": {
        "indent": ["error", 2],
        "quotes": ["error", "single"],
        "linebreak-style": ["error", "unix"],
        "semi": ["error", "always"],
        "no-console": "off",
        "arrow-parens": ["error", "always"],
        "arrow-body-style": ["error", "always"],
        "array-callback-return": "error",
        "no-magic-numbers": ["error", {
          "ignore": [-1, 0, 1, 2],
          "ignoreArrayIndexes": true,
          "detectObjects": true
        }],
        "no-var": "error",
        "no-warning-comments": "warn",
        "handle-callback-err": "error"
      },
      "languageOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "globals": {
          "node": true,
          "es2019": true
        }
      }
    }
  ];
