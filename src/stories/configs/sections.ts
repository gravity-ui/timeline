import {
  TimeLineConfig,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
} from "../../types";
import { commonConfig } from "./common";
import { MySectionRenderer, MySectionWithGradient } from "../MySectionRenderer";

const baseEvents: TimelineEvent[] = [
  {
    id: "task1",
    from: 1739537140000,
    to: 1739537155000,
    axisId: "main",
    trackIndex: 1,
    color: "rgb(33, 150, 243)",
  },
  {
    id: "task2",
    from: 1739537160000,
    to: 1739537175000,
    axisId: "main",
    trackIndex: 2,
    color: "rgb(76, 175, 80)",
  },
];

export const basicSectionsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    ...commonConfig,
    events: baseEvents,
    sections: [
      {
        id: "phase1",
        from: 1739537130000,
        to: 1739537150000,
        color: "rgba(255, 235, 59, 0.3)", // Light yellow
        hoverColor: "rgba(255, 235, 59, 0.4)",
      },
      {
        id: "phase2",
        from: 1739537150000,
        to: 1739537170000,
        color: "rgba(76, 175, 80, 0.3)", // Light green
        hoverColor: "rgba(76, 175, 80, 0.4)",
      },
      {
        id: "phase3",
        from: 1739537170000,
        // No 'to' - extends to end
        color: "rgba(244, 67, 54, 0.3)", // Light red
        hoverColor: "rgba(244, 67, 54, 0.4)",
      },
    ],
  },
};

export const overlappingSectionsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    ...commonConfig,
    events: baseEvents,
    sections: [
      {
        id: "background",
        from: 1739537126347,
        to: 1739537186347,
        color: "rgba(158, 158, 158, 0.2)", // Light gray background
        hoverColor: "rgba(158, 158, 158, 0.3)",
      },
      {
        id: "critical-period",
        from: 1739537140000,
        to: 1739537170000,
        color: "rgba(255, 152, 0, 0.3)", // Orange
        hoverColor: "rgba(255, 152, 0, 0.4)",
      },
      {
        id: "urgent-task",
        from: 1739537155000,
        to: 1739537165000,
        color: "rgba(244, 67, 54, 0.4)", // Red
        hoverColor: "rgba(244, 67, 54, 0.5)",
      },
    ],
  },
};

export const timePeriodsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    ...commonConfig,
    events: [
      {
        id: "morning-standup",
        from: 1739537132000,
        to: 1739537138000,
        axisId: "main",
        trackIndex: 0,
        color: "rgb(103, 58, 183)",
      },
      {
        id: "development",
        from: 1739537145000,
        to: 1739537175000,
        axisId: "main",
        trackIndex: 1,
        color: "rgb(33, 150, 243)",
      },
      {
        id: "testing",
        from: 1739537165000,
        to: 1739537180000,
        axisId: "main",
        trackIndex: 2,
        color: "rgb(255, 152, 0)",
      },
    ],
    sections: [
      {
        id: "morning",
        from: 1739537126347,
        to: 1739537146347, // 20 seconds
        color: "rgba(255, 193, 7, 0.25)", // Morning - light amber
        hoverColor: "rgba(255, 193, 7, 0.35)",
      },
      {
        id: "midday",
        from: 1739537146347,
        to: 1739537166347, // Next 20 seconds
        color: "rgba(33, 150, 243, 0.25)", // Midday - light blue
        hoverColor: "rgba(33, 150, 243, 0.35)",
      },
      {
        id: "afternoon",
        from: 1739537166347,
        // Extends to end
        color: "rgba(156, 39, 176, 0.25)", // Afternoon - light purple
        hoverColor: "rgba(156, 39, 176, 0.35)",
      },
    ],
    markers: [
      {
        time: 1739537136347,
        color: "rgb(255, 152, 0)",
        activeColor: "rgb(255, 193, 7)",
        hoverColor: "rgb(255, 87, 34)",
        label: "Day Start",
      },
      {
        time: 1739537156347,
        color: "rgb(33, 150, 243)",
        activeColor: "rgb(3, 169, 244)",
        hoverColor: "rgb(2, 136, 209)",
        label: "Lunch Break",
      },
      {
        time: 1739537176347,
        color: "rgb(156, 39, 176)",
        activeColor: "rgb(171, 71, 188)",
        hoverColor: "rgb(142, 36, 170)",
        label: "Day End",
      },
    ],
  },
};

export const prioritySectionsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    ...commonConfig,
    events: baseEvents,
    sections: [
      {
        id: "low-priority",
        from: 1739537126347,
        to: 1739537140000,
        color: "rgba(76, 175, 80, 0.2)", // Green - low priority
        hoverColor: "rgba(76, 175, 80, 0.3)",
      },
      {
        id: "medium-priority",
        from: 1739537140000,
        to: 1739537165000,
        color: "rgba(255, 152, 0, 0.3)", // Orange - medium priority
        hoverColor: "rgba(255, 152, 0, 0.4)",
      },
      {
        id: "high-priority",
        from: 1739537165000,
        to: 1739537180000,
        color: "rgba(244, 67, 54, 0.4)", // Red - high priority
        hoverColor: "rgba(244, 67, 54, 0.5)",
      },
      {
        id: "critical-priority",
        from: 1739537180000,
        // Extends to end
        color: "rgba(156, 39, 176, 0.4)", // Purple - critical
        hoverColor: "rgba(156, 39, 176, 0.5)",
      },
    ],
  },
};

export const workflowSectionsConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  TimelineSection
> = {
  settings: {
    ...commonConfig,
    events: [
      {
        id: "planning",
        from: 1739537130000,
        to: 1739537140000,
        axisId: "main",
        trackIndex: 0,
        color: "rgb(63, 81, 181)",
      },
      {
        id: "development",
        from: 1739537145000,
        to: 1739537170000,
        axisId: "main",
        trackIndex: 1,
        color: "rgb(33, 150, 243)",
      },
      {
        id: "review",
        from: 1739537172000,
        to: 1739537180000,
        axisId: "main",
        trackIndex: 2,
        color: "rgb(255, 152, 0)",
      },
      {
        id: "deployment",
        from: 1739537182000,
        to: 1739537186347,
        axisId: "main",
        trackIndex: 3,
        color: "rgb(76, 175, 80)",
      },
    ],
    sections: [
      {
        id: "planning-phase",
        from: 1739537126347,
        to: 1739537145000,
        color: "rgba(63, 81, 181, 0.2)", // Indigo - planning
        hoverColor: "rgba(63, 81, 181, 0.3)",
      },
      {
        id: "development-phase",
        from: 1739537145000,
        to: 1739537172000,
        color: "rgba(33, 150, 243, 0.2)", // Blue - development
        hoverColor: "rgba(33, 150, 243, 0.3)",
      },
      {
        id: "testing-phase",
        from: 1739537172000,
        to: 1739537182000,
        color: "rgba(255, 152, 0, 0.2)", // Orange - testing
        hoverColor: "rgba(255, 152, 0, 0.3)",
      },
      {
        id: "deployment-phase",
        from: 1739537182000,
        // Extends to end
        color: "rgba(76, 175, 80, 0.2)", // Green - deployment
        hoverColor: "rgba(76, 175, 80, 0.3)",
      },
    ],
    markers: [
      {
        time: 1739537145000,
        color: "rgb(63, 81, 181)",
        activeColor: "rgb(92, 107, 192)",
        hoverColor: "rgb(57, 73, 171)",
        label: "Dev Start",
      },
      {
        time: 1739537172000,
        color: "rgb(255, 152, 0)",
        activeColor: "rgb(255, 193, 7)",
        hoverColor: "rgb(255, 87, 34)",
        label: "Testing",
      },
      {
        time: 1739537182000,
        color: "rgb(76, 175, 80)",
        activeColor: "rgb(102, 187, 106)",
        hoverColor: "rgb(67, 160, 71)",
        label: "Deploy",
      },
    ],
  },
};

// Custom sections with advanced rendering
const customSections: MySectionWithGradient[] = [
  {
    id: "gradient-background",
    from: 1739537126347,
    to: 1739537150000,
    color: "rgba(33, 150, 243, 0.3)",
    hoverColor: "rgba(33, 150, 243, 0.4)",
    gradientDirection: "horizontal",
    borderColor: "rgb(33, 150, 243)",
    borderWidth: 1,
    renderer: new MySectionRenderer(),
  },
  {
    id: "dotted-section",
    from: 1739537150000,
    to: 1739537170000,
    color: "rgba(76, 175, 80, 0.3)",
    hoverColor: "rgba(76, 175, 80, 0.4)",
    pattern: "dots",
    borderColor: "rgb(76, 175, 80)",
    borderWidth: 2,
    renderer: new MySectionRenderer(),
  },
  {
    id: "striped-section",
    from: 1739537170000,
    // Extends to end
    color: "rgba(255, 152, 0, 0.3)",
    hoverColor: "rgba(255, 152, 0, 0.4)",
    pattern: "stripes",
    gradientDirection: "vertical",
    borderColor: "rgb(255, 152, 0)",
    borderWidth: 1,
    renderer: new MySectionRenderer(),
  },
];

export const customRenderersConfig: TimeLineConfig<
  TimelineEvent,
  TimelineMarker,
  MySectionWithGradient
> = {
  settings: {
    ...commonConfig,
    events: baseEvents,
    sections: customSections,
  },
};
