import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeSelection } from "./integrations/RangeSelection";
import { TimelineWithPopup } from "./integrations/Popup";
import { ListIntegration } from "./integrations/List";
import { NestedEvents } from "./integrations/NestedEvents";
import { DragHandlerDemo } from "./integrations/DragHandler";

const meta = {
  title: "Integrations/gravity-ui",
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
        story:
          "Integration with @gravity-ui/date-components RangeDateSelection. " +
          "Features: hidden default ruler, synchronized grid lines with RangeDateSelection ticks, " +
          "draggable ruler for smooth panning.",
      },
    },
  },
};

export const Popup: Story = {
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
  render: () => <ListIntegration />,
  parameters: {
    docs: {
      description: {
        story: "List component from integrations",
      },
    },
  },
};

export const NestedEventsStory: Story = {
  name: "NestedEvents",
  render: () => <NestedEvents />,
  parameters: {
    docs: {
      description: {
        story: "Timeline with nested/hierarchical events",
      },
    },
  },
};

export const DragHandler: Story = {
  name: "DragHandler",
  render: () => <DragHandlerDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Drag-to-pan functionality for Timeline. Allows users to drag the canvas horizontally to pan through time, and vertically to scroll lanes. Supports both mouse and touch interactions with smooth performance via requestAnimationFrame optimization.",
      },
    },
  },
};
