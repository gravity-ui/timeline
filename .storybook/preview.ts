import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Open Canvas (story) by default instead of Docs
    viewMode: "story",
    docs: {
      toc: true,
    },
    options: {
      // Ensure Playground/Default is first in the sidebar
      storySort: {
        order: ["Playground", ["Default", "*"], "Intro", "Components", "*"],
      },
    },
  },
};

export default preview;
