// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import baseConfig from "@gravity-ui/eslint-config";
import prettierConfig from "@gravity-ui/eslint-config/prettier";
import reactConfig from "@gravity-ui/eslint-config/react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      "build/**",
      "storybook-static/**",
      "node_modules/**",
      "dist/**",
      "*.config.cjs",
      "*.config.js",
    ],
  },
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
  {
    files: ["src/stories/**/*.{ts,tsx}"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["src/stories/StoryWrapper.tsx"],
    rules: {
      "no-param-reassign": "off",
    },
  },
  {
    files: [
      "src/components/**/Default*Renderer.ts",
      "src/stories/My*Renderer.ts",
      "src/components/**/Abstract*Renderer.ts",
    ],
    rules: {
      "no-param-reassign": ["error", { props: false }],
    },
  },
  ...storybook.configs["flat/recommended"],
];
