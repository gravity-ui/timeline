import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RangeSelection } from "./integrations/RangeSelection";
import { TimelineWithPopup } from "./integrations/Popup";
import { ListIntegration } from "./integrations/List";

const meta = {
  title: "Timeline/Integrations",
  component: null,
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TimelineRuler: Story = {
  name: "TimelineRuler",
  render: () => <RangeSelection />,
  parameters: {
    docs: {
      description: {
        story: "RangeDateSelection component from integrations",
      },
    },
  },
};

export const Popup: Story = {
  name: "Popup",
  render: () => <TimelineWithPopup />,
  parameters: {
    docs: {
      description: {
        story: "Popup component from integrations",
      },
    },
  },
};

export const List: Story = {
  name: "List",
  render: () => <ListIntegration />,
  parameters: {
    docs: {
      description: {
        story: "List component from integrations",
      },
    },
  },
};
