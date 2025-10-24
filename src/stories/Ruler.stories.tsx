import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/de";
import "dayjs/locale/fr";
import "dayjs/locale/es";
import "dayjs/locale/ja";
import "dayjs/locale/zh-cn";
import { baseTimelineConfig } from "./configs/events";
import { defaultViewConfig } from "../constants/options";
import { StoryWrapper } from "./StoryWrapper";
import {
  RulerLevel,
  TimelineEvent,
  TimelineMarker,
  TimelineSection,
  TimelineSettings,
  ViewConfiguration,
} from "../types";
import { ZoomMode } from "../enums";
import { DAY, MONTH, YEAR } from "../constants/timeConstants";

type ViewConfigurationControls = {
  [K in keyof ViewConfiguration as `viewConfiguration.${K}`]: ViewConfiguration[K];
};

type SettingsControls = {
  [K in keyof TimelineSettings<
    TimelineEvent,
    TimelineMarker,
    TimelineSection
  > as `settings.${K}`]: TimelineSettings<
    TimelineEvent,
    TimelineMarker,
    TimelineSection
  >[K];
};

type StoryProps = SettingsControls & ViewConfigurationControls;

const meta = {
  title: "Components/Ruler",
  component: StoryWrapper as React.ComponentType<StoryProps>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `

The Ruler component is responsible for rendering the time scale and labels on the timeline. It handles the visualization of time intervals, grid lines, and their labels with automatic level selection based on zoom level.

## Key Features

- **Automatic Level Selection**: Dynamically chooses appropriate time granularity based on zoom
- **Multi-level Display**: Primary and secondary time marking levels
- **Custom Level Labels**: Define your own time scales and formatting
- **Dynamic Coloring**: Apply custom colors to specific time periods
- **Format Flexibility**: Use dayjs format strings for any date/time format
- **Collision Avoidance**: Smart label rendering to prevent overlap

## Ruler Configuration

### Basic Configuration

\`\`\`typescript
viewConfiguration: {
  ruler: {
    height: 32,              // Height of the ruler in pixels
    font: '12px Arial',      // Font for labels
    spacing: 100,            // Minimum spacing between labels
    position: 24,            // Y position for primary level labels
    subPosition: 12,         // Y position for secondary level labels
    color: {
      background: '#ffffff',
      borderColor: '#e0e0e0',
      primaryLevel: '#000000',
      secondaryLevel: '#666666',
      textOutlineColor: '#ffffff',
      rulerWeekendColor: '#ff0000'
    }
  }
}
\`\`\`

### Custom Level Labels

The \`customLevelLabels\` setting allows you to define custom time marking levels:

\`\`\`typescript
settings: {
  customLevelLabels: () => {
    const sprintStartDate = Date.now() - 30 * DAY;
    
    return [
      {
        domain: YEAR,                    // Maximum time domain for this level
        format: '[Sprint] S',            // Date format string (dayjs)
        step: (t) => t.add(14, 'day'),   // 2-week sprints
        start: (t) => {                  // Calculate sprint start
          const daysSinceBaseline = Math.floor((t - sprintStartDate) / DAY);
          const sprintNumber = Math.floor(daysSinceBaseline / 14);
          return dayjs(sprintStartDate).add(sprintNumber * 14, 'day');
        },
        color: (t) => {                  // Alternate colors for sprints
          const timestamp = typeof t === 'number' ? t : t.valueOf();
          const daysSinceBaseline = Math.floor((timestamp - sprintStartDate) / DAY);
          const sprintNumber = Math.floor(daysSinceBaseline / 14);
          return sprintNumber % 2 === 0 ? '#4CAF50' : '#FF9800';
        },
        sup: {                           // Secondary level
          format: 'MMM YYYY',
          step: (t) => t.add(1, 'month'),
          start: (t) => dayjs(t).startOf('month')
        }
      }
    ];
  }
}
\`\`\`

### Localization

To use localized date/time labels, import the desired dayjs locale and apply it in the \`start\` function:

\`\`\`typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ru';  // Import Russian locale

settings: {
  customLevelLabels: () => [
    {
      domain: YEAR,
      format: 'MMMM YYYY',              // Will display as "Январь 2024"
      step: (t) => t.add(1, 'month'),
      start: (t) => dayjs(t).locale('ru').startOf('month')  // Apply locale here
    }
  ]
}
\`\`\`

The locale is preserved throughout the rendering process, ensuring all labels use the specified locale.

### Dynamic Locale Switching

For applications that need to change locale at runtime, use global dayjs locale without \`.locale()\` calls in \`start\`:

\`\`\`typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';

// Don't call .locale() in start functions
settings: {
  customLevelLabels: () => [
    {
      domain: YEAR,
      format: 'MMMM YYYY',
      step: (t) => t.add(1, 'month'),
      start: (t) => dayjs(t).startOf('month')  // No .locale() call
    }
  ]
}

// Switch locale dynamically
dayjs.locale('ru');
timeline.render();  // Russian labels

dayjs.locale('en');
timeline.render();  // English labels
\`\`\`

## RulerLevel Structure

Each level has the following structure:

\`\`\`typescript
type RulerLevel = {
  domain: number;           // Maximum time domain in milliseconds
  format: string;          // Date format string (dayjs format)
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;  // Function to step to next time point
  start: (t: number) => dayjs.Dayjs;      // Function to get start time
  color?: (t: number) => string | null;   // Optional dynamic color function
  sup?: RulerSupLevel;     // Optional secondary level
};
\`\`\`

## Use Cases

- **Agile Development**: Track 2-week sprints with automatic numbering and color coding
- **Custom Time Scales**: Define business-specific periods (sprints, phases, milestones)
- **Dynamic Coloring**: Highlight specific periods with custom colors
- **Custom Formatting**: Apply project-specific date formats and labels
`,
      },
    },
  },
  argTypes: {
    "settings.start": {
      control: {
        type: "number",
      },
      description: "Start timestamp of the timeline",
      table: {
        category: "settings",
      },
    },
    "settings.end": {
      control: {
        type: "number",
      },
      description: "End timestamp of the timeline",
      table: {
        category: "settings",
      },
    },
    "settings.axes": {
      control: {
        type: "object",
      },
      description: "Timeline axes configuration",
      table: {
        category: "settings",
        type: {
          summary: "TimelineAxis[]",
          detail: JSON.stringify(baseTimelineConfig.settings.axes, null, 2),
        },
      },
    },
    "settings.events": {
      control: {
        type: "object",
      },
      description: "Timeline events configuration",
      table: {
        category: "settings",
        type: {
          summary: "TimelineEvent[]",
          detail: JSON.stringify(baseTimelineConfig.settings.events, null, 2),
        },
      },
    },
    "viewConfiguration.hideRuler": {
      control: {
        type: "boolean",
      },
      description: "Whether to hide the ruler",
      table: {
        category: "viewConfiguration",
      },
    },
    "viewConfiguration.ruler": {
      control: {
        type: "object",
      },
      description: "Ruler view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "RulerViewOptions",
          detail: JSON.stringify(defaultViewConfig.ruler, null, 2),
        },
      },
    },
    "viewConfiguration.grid": {
      control: {
        type: "object",
      },
      description: "Grid view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "GridViewOptions",
          detail: JSON.stringify(defaultViewConfig.grid, null, 2),
        },
      },
    },
    "viewConfiguration.axes": {
      control: {
        type: "object",
      },
      description: "Axes view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "AxesViewOptions",
          detail: JSON.stringify(defaultViewConfig.axes, null, 2),
        },
      },
    },
    "viewConfiguration.events": {
      control: {
        type: "object",
      },
      description: "Events view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "EventsViewOptions",
          detail: JSON.stringify(defaultViewConfig.events, null, 2),
        },
      },
    },
    "viewConfiguration.camera": {
      control: {
        type: "object",
      },
      description: "Camera view options",
      table: {
        category: "viewConfiguration",
        type: {
          summary: "CameraViewOptions",
          detail: `Available zoom modes:\n${Object.entries(ZoomMode)
            .map(([key, value]) => `- ${key}: "${value}"`)
            .join(
              "\n",
            )}\n\nDefault configuration:\n${JSON.stringify(defaultViewConfig.camera, null, 2)}`,
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
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultViewConfigArgs: ViewConfigurationControls = {
  "viewConfiguration.hideRuler": defaultViewConfig.hideRuler,
  "viewConfiguration.ruler": defaultViewConfig.ruler,
  "viewConfiguration.grid": defaultViewConfig.grid,
  "viewConfiguration.axes": defaultViewConfig.axes,
  "viewConfiguration.events": defaultViewConfig.events,
  "viewConfiguration.markers": defaultViewConfig.markers,
  "viewConfiguration.camera": defaultViewConfig.camera,
};

// Helper to create sprint-based levels (2-week sprints)
const createSprintLevels = (): RulerLevel[] => {
  const sprintStartDate = Date.now() - 30 * DAY; // 30 days ago as sprint baseline

  return [
    {
      domain: DAY,
      format: "HH",
      step: (t) => t.add(1, "hour"),
      start: (t) => dayjs(t).startOf("hour"),
      sup: {
        format: "MMM D",
        step: (t) => t.add(1, "day"),
        start: (t) => dayjs(t).startOf("day"),
      },
    },
    {
      domain: MONTH,
      format: "D",
      step: (t) => t.add(1, "day"),
      start: (t) => dayjs(t).startOf("day"),
      color: (t) => {
        const weekday = dayjs(t).day();
        return weekday === 6 || weekday === 0 ? "#E0E0E0" : null;
      },
      sup: {
        format: "MMM",
        step: (t) => t.add(1, "month"),
        start: (t) => dayjs(t).startOf("month"),
      },
    },
    {
      domain: YEAR,
      format: "[Sprint] S",
      step: (t) => t.add(14, "day"), // 2-week sprints
      start: (t) => {
        // Calculate sprint start based on baseline
        const daysSinceBaseline = Math.floor((t - sprintStartDate) / DAY);
        const sprintNumber = Math.floor(daysSinceBaseline / 14);
        return dayjs(sprintStartDate).add(sprintNumber * 14, "day");
      },
      color: (t) => {
        // Alternate sprint colors
        const timestamp = typeof t === "number" ? t : t.valueOf();
        const daysSinceBaseline = Math.floor(
          (timestamp - sprintStartDate) / DAY,
        );
        const sprintNumber = Math.floor(daysSinceBaseline / 14);
        return sprintNumber % 2 === 0 ? "#4CAF50" : "#FF9800";
      },
      sup: {
        format: "MMM YYYY",
        step: (t) => t.add(1, "month"),
        start: (t) => dayjs(t).startOf("month"),
      },
    },
    {
      domain: Infinity,
      format: "MMM YYYY",
      step: (t) => t.add(1, "month"),
      start: (t) => dayjs(t).startOf("month"),
    },
  ];
};

const now = Date.now();

export const SprintLevels: Story = {
  args: {
    "settings.start": now - 60 * DAY, // 2 months ago
    "settings.end": now + 60 * DAY, // 2 months from now
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": [
      {
        id: "sprint-1-task",
        from: now - 50 * DAY,
        to: now - 40 * DAY,
        axisId: "main",
        trackIndex: 0,
      },
      {
        id: "sprint-2-task",
        from: now - 30 * DAY,
        to: now - 20 * DAY,
        axisId: "main",
        trackIndex: 1,
      },
      {
        id: "sprint-3-task",
        from: now - 10 * DAY,
        to: now + 5 * DAY,
        axisId: "main",
        trackIndex: 2,
      },
      {
        id: "sprint-4-task",
        from: now + 10 * DAY,
        to: now + 25 * DAY,
        axisId: "main",
        trackIndex: 0,
      },
    ],
    "settings.customLevelLabels": createSprintLevels,
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "sprint",
    docs: {
      description: {
        story:
          "Demonstration of sprint-based time levels with 2-week sprints. Each sprint is labeled and alternately colored (green for even sprints, orange for odd sprints). Weekends are shown in gray. This is useful for agile project management and development planning.",
      },
    },
  },
};

// Helper to create localized levels (Russian)
const createLocalizedLevels = (locale: string): RulerLevel[] => {
  return [
    {
      domain: DAY,
      format: "HH",
      step: (t) => t.add(1, "hour"),
      start: (t) => dayjs(t).locale(locale).startOf("hour"),
      sup: {
        format: "D MMMM",
        step: (t) => t.add(1, "day"),
        start: (t) => dayjs(t).locale(locale).startOf("day"),
      },
    },
    {
      domain: MONTH,
      format: "D",
      step: (t) => t.add(1, "day"),
      start: (t) => dayjs(t).locale(locale).startOf("day"),
      color: (t) => {
        const weekday = dayjs(t).day();
        return weekday === 6 || weekday === 0 ? "#E0E0E0" : null;
      },
      sup: {
        format: "MMMM",
        step: (t) => t.add(1, "month"),
        start: (t) => dayjs(t).locale(locale).startOf("month"),
      },
    },
    {
      domain: YEAR,
      format: "MMMM",
      step: (t) => t.add(1, "month"),
      start: (t) => dayjs(t).locale(locale).startOf("month"),
      sup: {
        format: "YYYY",
        step: (t) => t.add(1, "year"),
        start: (t) => dayjs(t).locale(locale).startOf("year"),
      },
    },
    {
      domain: Infinity,
      format: "YYYY",
      step: (t) => t.add(1, "year"),
      start: (t) => dayjs(t).locale(locale).startOf("year"),
    },
  ];
};

export const LocalizedRussian: Story = {
  args: {
    "settings.start": now - 60 * DAY, // 2 months ago
    "settings.end": now + 60 * DAY, // 2 months from now
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": baseTimelineConfig.settings.events,
    "settings.customLevelLabels": () => createLocalizedLevels("ru"),
    ...defaultViewConfigArgs,
  },
  parameters: {
    storyKey: "localized-ru",
    docs: {
      description: {
        story:
          "Demonstration of localized ruler with Russian locale. Month and day names are displayed in Russian. To use localization, import the desired locale from dayjs (e.g., `import 'dayjs/locale/ru'`) and apply it in the `start` function using `.locale('ru')`. The fix ensures that the locale is preserved throughout the rendering process.",
      },
    },
  },
};

// Helper to create levels that use global dayjs locale
const createGlobalLocaleLevels = (): RulerLevel[] => {
  return [
    {
      domain: DAY,
      format: "HH",
      step: (t) => t.add(1, "hour"),
      start: (t) => dayjs(t).startOf("hour"),
      sup: {
        format: "D MMMM",
        step: (t) => t.add(1, "day"),
        start: (t) => dayjs(t).startOf("day"),
      },
    },
    {
      domain: MONTH,
      format: "D",
      step: (t) => t.add(1, "day"),
      start: (t) => dayjs(t).startOf("day"),
      color: (t) => {
        const weekday = dayjs(t).day();
        return weekday === 6 || weekday === 0 ? "#E0E0E0" : null;
      },
      sup: {
        format: "MMMM",
        step: (t) => t.add(1, "month"),
        start: (t) => dayjs(t).startOf("month"),
      },
    },
    {
      domain: YEAR,
      format: "MMMM",
      step: (t) => t.add(1, "month"),
      start: (t) => dayjs(t).startOf("month"),
      sup: {
        format: "YYYY",
        step: (t) => t.add(1, "year"),
        start: (t) => dayjs(t).startOf("year"),
      },
    },
    {
      domain: Infinity,
      format: "YYYY",
      step: (t) => t.add(1, "year"),
      start: (t) => dayjs(t).startOf("year"),
    },
  ];
};

type DynamicLocaleStoryProps = StoryProps & {
  locale: string;
};

export const DynamicLocale: StoryObj<DynamicLocaleStoryProps> = {
  args: {
    "settings.start": now - 60 * DAY, // 2 months ago
    "settings.end": now + 60 * DAY, // 2 months from now
    "settings.axes": baseTimelineConfig.settings.axes,
    "settings.events": baseTimelineConfig.settings.events,
    "settings.customLevelLabels": createGlobalLocaleLevels,
    ...defaultViewConfigArgs,
    locale: "en",
  },
  argTypes: {
    locale: {
      control: {
        type: "select",
      },
      options: ["en", "ru", "de", "fr", "es", "ja", "zh-cn"],
      description: "Select locale to dynamically change ruler labels language",
      table: {
        category: "Localization",
        defaultValue: { summary: "en" },
      },
    },
  },
  render: (args) => {
    // Set global dayjs locale based on selected value
    dayjs.locale(args.locale);

    const { locale, ...storyWrapperProps } = args;
    return <StoryWrapper {...storyWrapperProps} key={locale} />;
  },
  parameters: {
    storyKey: "dynamic-locale",
    docs: {
      description: {
        story: `
Demonstration of dynamic locale switching using global dayjs locale. Use the **locale** selector above to switch between different languages and see the ruler labels change in real-time.

### Supported Locales:
- **en** - English (default)
- **ru** - Russian (Русский)
- **de** - German (Deutsch)
- **fr** - French (Français)
- **es** - Spanish (Español)
- **ja** - Japanese (日本語)
- **zh-cn** - Chinese Simplified (简体中文)

### How It Works:

This approach uses global dayjs locale without \`.locale()\` calls in the level \`start\` functions:

\`\`\`typescript
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';

// Create levels WITHOUT .locale() calls in start functions
const levels: RulerLevel[] = [
  {
    domain: YEAR,
    format: 'MMMM YYYY',
    step: (t) => t.add(1, 'month'),
    start: (t) => dayjs(t).startOf('month'),  // No .locale() here
  }
];

// Change locale dynamically
function switchLocale(locale: string) {
  dayjs.locale(locale);  // Set global locale
  timeline.render();     // Re-render to apply changes
}

switchLocale('ru');  // → Январь 2024
switchLocale('en');  // → January 2024
\`\`\`

### When to Use This Approach:
- Applications with user language preferences
- Multi-language dashboards
- Any scenario requiring runtime locale switching
        `,
      },
    },
  },
};
