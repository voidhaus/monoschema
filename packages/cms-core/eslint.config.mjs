import baseConfig from "@voidhaus/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**"]
  }
];
