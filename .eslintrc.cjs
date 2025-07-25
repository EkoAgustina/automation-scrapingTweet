module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: "module",
    project: "./tsconfig.json"
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": "off"
  }
};