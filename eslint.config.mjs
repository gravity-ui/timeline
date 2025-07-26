import baseConfig from "@gravity-ui/eslint-config";
import prettierConfig from "@gravity-ui/eslint-config/prettier";
import reactConfig from "@gravity-ui/eslint-config/react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  ...baseConfig,
  ...prettierConfig,
  ...reactConfig,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      curly: "off",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            accessors: "explicit",
            constructors: "no-public",
            methods: "explicit",
            properties: "off",
            parameterProperties: "explicit",
          },
        },
      ],
    },
  },
];
