import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import ts from "typescript-eslint";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
      semi: ["error", "never"],
      quotes: ["error", "single"],
      indent: ["error", 2],
    },
  },
  {
    ignores: ["dist", "node_modules"],
  },
];
