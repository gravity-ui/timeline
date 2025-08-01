import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RangeSelection } from "./integrations/RangeSelection";

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
