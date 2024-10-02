import globals from "globals";
import pluginJs from "@eslint/js";
import js from "@eslint/js";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
      ecmaVersion: "latest",
    },
    ignores: ["dist/**", "build/**"],
    plugins: {
      "@stylistic/js": stylisticJs,
    },
    rules: {
      "@stylistic/js/indent": ["error", 2],
      "@stylistic/js/linebreak-style": "off",
      "@stylistic/js/quotes": ["error", "double"],
      "@stylistic/js/semi": ["error", "always"],
      eqeqeq: "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": ["error", { before: true, after: true }],
      "no-console": "warn",
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-multiple-empty-lines": ["error", { max: 2 }],
      "no-undef": "error",
    },
  },
  js.configs.recommended,
  pluginJs.configs.recommended,
];
