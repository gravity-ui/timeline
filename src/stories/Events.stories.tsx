import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { baseTimelineConfig, endlessTimelineConfig } from "./configs";
import { defaultViewConfig } from "../constants/options";
import { StoryWrapper } from "./StoryWrapper";
import { TimelineSettings, ViewConfiguration } from "../types";

const meta: Meta<{
  settings: TimelineSettings;
  viewConfiguration: ViewConfiguration;
}> = {
  title: "Timeline/Events",
  component: StoryWrapper,
  argTypes: {
    settings: {
      control: {
        type: "object",
      },
      description: "Timeline settings object",
      table: {
        type: {
          summary: "Settings",
          detail: JSON.stringify(baseTimelineConfig, null, 2),
        },
      },
    },
    viewConfiguration: {
      control: {
        type: "object",
      },
      description: "View configuration object",
      table: {
        type: {
          summary: "ViewConfiguration",
          detail: JSON.stringify(defaultViewConfig, null, 2),
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    settings: baseTimelineConfig.settings,
    viewConfiguration: defaultViewConfig,
  },
  parameters: {
    storyKey: "basic",
    docs: {
      description: {
        story: "Basic timeline configuration with regular events",
      },
    },
  },
};

export const EndlessTimelines: Story = {
  args: {
    settings: endlessTimelineConfig.settings,
    viewConfiguration: defaultViewConfig,
  },
  parameters: {
    storyKey: "endless",
    docs: {
      description: {
        story: "Demonstration of a timeline with infinite scrolling",
      },
    },
  },
};
