import { TimelineEvent } from "../../../types";

export type TestItem =
  | TimelineEvent
  | (TimelineEvent & {
      items: (TimelineEvent & { subItem: true })[];
      open: boolean;
    });

export const AXIS_HEIGHT = 25;
export const STORY_ITEMS: TestItem[] = [
  {
    id: "item 1",
    axisId: "axis1",
    trackIndex: 0,
    from: 1739537144007,
    to: 1739537156347,
    color: "rgb(174,194,228)",
  },
  {
    id: "item 2",
    axisId: "axis2",
    trackIndex: 2,
    from: 1739537146000,
    to: 1739537160347,
    color: "rgb(45,181,254)",
  },
  {
    id: "item 3",
    axisId: "axis3",
    trackIndex: 3,
    from: 1739537150000,
    to: 1739537170000,
    color: "rgb(254, 127, 45)",
    open: false,
    items: [
      {
        id: "subitem 1",
        axisId: "sub_axis3",
        trackIndex: 0,
        from: 1739537150000,
        to: 1739537155000,
        color: "rgb(255,198,2)",
        subItem: true,
      },
      {
        id: "subitem 2",
        axisId: "sub_axis3",
        trackIndex: 1,
        from: 1739537155000,
        to: 1739537165000,
        color: "rgb(234,0,0)",
        subItem: true,
      },
      {
        id: "subitem 3",
        axisId: "sub_axis3",
        trackIndex: 2,
        from: 1739537165000,
        to: 1739537170000,
        subItem: true,
        color: "rgb(115,0,255)",
      },
    ],
  },
  {
    id: "item 4",
    axisId: "axis4",
    trackIndex: 4,
    from: 1739537160000,
    to: 1739537170000,
    color: "rgb(174,194,228)",
  },
];
