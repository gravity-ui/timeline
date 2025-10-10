import {
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  TimelineSettings,
  ViewConfiguration,
} from "../types";
import { ZoomMode } from "../enums";
import { defaultViewConfig } from "../constants/options";

export interface PlaygroundTemplate {
  name: string;
  description: string;
  settings: TimelineSettings<TimelineEvent, TimelineMarker, TimelineSection>;
  viewConfiguration: ViewConfiguration;
  category: "basic" | "advanced" | "business" | "creative";
}

export const playgroundTemplates: PlaygroundTemplate[] = [
  {
    name: "Simple Timeline",
    description: "Basic configuration with several events on one axis",
    category: "basic",
    settings: {
      start: Date.now() - 86400000,
      end: Date.now() + 86400000,
      axes: [
        {
          id: "main-axis",
          tracksCount: 3,
          top: 0,
          height: 100,
        },
      ],
      events: [
        {
          id: "meeting-1",
          axisId: "main-axis",
          trackIndex: 0,
          from: Date.now() - 3600000,
          to: Date.now() - 1800000,
          color: "#3b82f6",
        },
        {
          id: "meeting-2",
          axisId: "main-axis",
          trackIndex: 1,
          from: Date.now() - 1800000,
          to: Date.now(),
          color: "#10b981",
        },
        {
          id: "meeting-3",
          axisId: "main-axis",
          trackIndex: 2,
          from: Date.now(),
          to: Date.now() + 3600000,
          color: "#f59e0b",
        },
      ],
      selectedEventIds: [],
    },
    viewConfiguration: defaultViewConfig,
  },
  {
    name: "Multiple Axes",
    description: "Timeline with multiple axes for different teams",
    category: "business",
    settings: {
      start: Date.now() - 172800000, // 2 days ago
      end: Date.now() + 172800000, // 2 days from now
      axes: [
        {
          id: "frontend-team",
          tracksCount: 2,
          top: 0,
          height: 80,
        },
        {
          id: "backend-team",
          tracksCount: 2,
          top: 100,
          height: 80,
        },
        {
          id: "design-team",
          tracksCount: 1,
          top: 200,
          height: 80,
        },
      ],
      events: [
        // Frontend events
        {
          id: "frontend-sprint",
          axisId: "frontend-team",
          trackIndex: 0,
          from: Date.now() - 86400000,
          to: Date.now() + 86400000,
          color: "#8b5cf6",
        },
        {
          id: "frontend-review",
          axisId: "frontend-team",
          trackIndex: 1,
          from: Date.now() - 43200000,
          to: Date.now() - 21600000,
          color: "#06b6d4",
        },
        // Backend events
        {
          id: "backend-api",
          axisId: "backend-team",
          trackIndex: 0,
          from: Date.now() - 129600000,
          to: Date.now() - 43200000,
          color: "#ef4444",
        },
        {
          id: "backend-deploy",
          axisId: "backend-team",
          trackIndex: 1,
          from: Date.now() - 21600000,
          to: Date.now() + 21600000,
          color: "#f97316",
        },
        // Design events
        {
          id: "design-mockups",
          axisId: "design-team",
          trackIndex: 0,
          from: Date.now() - 172800000,
          to: Date.now() - 86400000,
          color: "#84cc16",
        },
      ],
      selectedEventIds: [],
    },
    viewConfiguration: defaultViewConfig,
  },
  {
    name: "Project Timeline",
    description: "Detailed timeline for project management with phases",
    category: "business",
    settings: {
      start: Date.now() - 2592000000, // 30 days ago
      end: Date.now() + 2592000000, // 30 days from now
      axes: [
        {
          id: "planning",
          tracksCount: 1,
          top: 0,
          height: 60,
        },
        {
          id: "development",
          tracksCount: 3,
          top: 80,
          height: 100,
        },
        {
          id: "testing",
          tracksCount: 2,
          top: 200,
          height: 80,
        },
        {
          id: "deployment",
          tracksCount: 1,
          top: 300,
          height: 60,
        },
      ],
      events: [
        // Planning phase
        {
          id: "project-planning",
          axisId: "planning",
          trackIndex: 0,
          from: Date.now() - 2592000000,
          to: Date.now() - 2160000000,
          color: "#6366f1",
        },
        // Development phase
        {
          id: "backend-dev",
          axisId: "development",
          trackIndex: 0,
          from: Date.now() - 2160000000,
          to: Date.now() - 1296000000,
          color: "#dc2626",
        },
        {
          id: "frontend-dev",
          axisId: "development",
          trackIndex: 1,
          from: Date.now() - 1728000000,
          to: Date.now() - 864000000,
          color: "#059669",
        },
        {
          id: "integration",
          axisId: "development",
          trackIndex: 2,
          from: Date.now() - 1296000000,
          to: Date.now() - 432000000,
          color: "#d97706",
        },
        // Testing phase
        {
          id: "unit-testing",
          axisId: "testing",
          trackIndex: 0,
          from: Date.now() - 864000000,
          to: Date.now() - 432000000,
          color: "#7c3aed",
        },
        {
          id: "integration-testing",
          axisId: "testing",
          trackIndex: 1,
          from: Date.now() - 432000000,
          to: Date.now(),
          color: "#0891b2",
        },
        // Deployment phase
        {
          id: "production-deploy",
          axisId: "deployment",
          trackIndex: 0,
          from: Date.now(),
          to: Date.now() + 864000000,
          color: "#16a34a",
        },
      ],
      selectedEventIds: [],
    },
    viewConfiguration: defaultViewConfig,
  },
  {
    name: "Creative Timeline",
    description: "Bright timeline with unconventional colors and settings",
    category: "creative",
    settings: {
      start: Date.now() - 432000000, // 5 days ago
      end: Date.now() + 432000000, // 5 days from now
      axes: [
        {
          id: "creative-axis",
          tracksCount: 4,
          top: 0,
          height: 120,
        },
      ],
      events: [
        {
          id: "brainstorm",
          axisId: "creative-axis",
          trackIndex: 0,
          from: Date.now() - 432000000,
          to: Date.now() - 345600000,
          color: "#ff6b6b",
        },
        {
          id: "prototype",
          axisId: "creative-axis",
          trackIndex: 1,
          from: Date.now() - 345600000,
          to: Date.now() - 259200000,
          color: "#4ecdc4",
        },
        {
          id: "iteration",
          axisId: "creative-axis",
          trackIndex: 2,
          from: Date.now() - 259200000,
          to: Date.now() - 172800000,
          color: "#45b7d1",
        },
        {
          id: "final-design",
          axisId: "creative-axis",
          trackIndex: 3,
          from: Date.now() - 172800000,
          to: Date.now() - 86400000,
          color: "#96ceb4",
        },
        {
          id: "presentation",
          axisId: "creative-axis",
          trackIndex: 0,
          from: Date.now() - 86400000,
          to: Date.now(),
          color: "#feca57",
        },
        {
          id: "feedback",
          axisId: "creative-axis",
          trackIndex: 1,
          from: Date.now(),
          to: Date.now() + 172800000,
          color: "#ff9ff3",
        },
      ],
      selectedEventIds: [],
    },
    viewConfiguration: {
      ...defaultViewConfig,
      hideRuler: false,
      grid: {
        ...defaultViewConfig.grid,
        color: {
          ...defaultViewConfig.grid.color,
          primaryMarkColor: "#e0e7ff",
        },
      },
      events: {
        ...defaultViewConfig.events,
        font: "14px Inter, sans-serif",
      },
      camera: {
        zoom: ZoomMode.DEFAULT,
      },
    },
  },
  {
    name: "Minimalist Timeline",
    description: "Clean timeline with minimal settings",
    category: "basic",
    settings: {
      start: Date.now() - 216000000, // 2.5 days ago
      end: Date.now() + 216000000, // 2.5 days from now
      axes: [
        {
          id: "minimal-axis",
          tracksCount: 2,
          top: 0,
          height: 80,
        },
      ],
      events: [
        {
          id: "task-1",
          axisId: "minimal-axis",
          trackIndex: 0,
          from: Date.now() - 216000000,
          to: Date.now() - 108000000,
          color: "#6b7280",
        },
        {
          id: "task-2",
          axisId: "minimal-axis",
          trackIndex: 1,
          from: Date.now() - 108000000,
          to: Date.now(),
          color: "#9ca3af",
        },
        {
          id: "task-3",
          axisId: "minimal-axis",
          trackIndex: 0,
          from: Date.now(),
          to: Date.now() + 108000000,
          color: "#d1d5db",
        },
      ],
      selectedEventIds: [],
    },
    viewConfiguration: {
      ...defaultViewConfig,
      hideRuler: true,
      grid: {
        ...defaultViewConfig.grid,
        color: {
          ...defaultViewConfig.grid.color,
          primaryMarkColor: "#f3f4f6",
        },
      },
      events: {
        ...defaultViewConfig.events,
        font: "12px system-ui, sans-serif",
      },
    },
  },
  {
    name: "High-Performance Timeline",
    description:
      "Optimized configuration for working with large numbers of events",
    category: "advanced",
    settings: {
      start: Date.now() - 604800000, // 7 days ago
      end: Date.now() + 604800000, // 7 days from now
      axes: [
        {
          id: "performance-axis",
          tracksCount: 10,
          top: 0,
          height: 200,
        },
      ],
      events: Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i}`,
        axisId: "performance-axis",
        trackIndex: i % 10,
        from: Date.now() - 604800000 + i * 12096000, // Spread over 7 days
        to: Date.now() - 604800000 + i * 12096000 + 86400000, // 1 day duration
        color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`, // Color wheel distribution
      })),
      selectedEventIds: [],
    },
    viewConfiguration: {
      ...defaultViewConfig,
      camera: {
        zoom: ZoomMode.DEFAULT,
      },
      events: {
        ...defaultViewConfig.events,
        font: "10px Arial, sans-serif",
        hitboxPadding: 2,
      },
    },
  },
];

export const getTemplatesByCategory = (
  category: PlaygroundTemplate["category"],
) => {
  return playgroundTemplates.filter(
    (template) => template.category === category,
  );
};

export const getTemplateById = (id: string) => {
  return playgroundTemplates.find((template) => template.name === id);
};
