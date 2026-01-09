import { useCallback, useMemo, useState } from "react";
import { AXIS_HEIGHT, STORY_ITEMS, TestItem } from "./config";
import { TimelineAxis, TimelineEvent } from "../../../types";

export const useNestedEvents = () => {
  const [rawEvents, setRawEvents] = useState<TestItem[]>(STORY_ITEMS);

  const toggleCollapse = useCallback((id: string) => {
    setRawEvents((prev) =>
      prev.map((item) =>
        item.id === id && "open" in item ? { ...item, open: !item.open } : item,
      ),
    );
  }, []);

  const axes = useMemo(() => {
    let top = 0;

    return rawEvents.reduce<TimelineAxis[]>((acc, item) => {
      acc.push({
        id: item.axisId,
        top,
        height: AXIS_HEIGHT,
        tracksCount: 1,
      });
      top += AXIS_HEIGHT;

      if ("open" in item && item.open) {
        const axisId = "sub_" + item.axisId;
        acc.push({
          id: axisId,
          top: top,
          height: AXIS_HEIGHT,
          tracksCount: item.items.length,
        });
        top += item.items.length * AXIS_HEIGHT;
      }

      return acc;
    }, []);
  }, [rawEvents]);

  const events = useMemo(() => {
    return rawEvents.reduce<TimelineEvent[]>((acc, item) => {
      acc.push(item);

      if ("open" in item && item.open) {
        acc = [...acc, ...item.items];
      }

      return acc;
    }, []);
  }, [rawEvents]);

  const interval = useMemo(() => {
    return events.reduce<{ from: number; to: number }>(
      (acc, item) => {
        acc.from = Math.min(acc.from, item.from);
        acc.to = Math.max(acc.to, item.to);
        return acc;
      },
      {
        from: Infinity,
        to: -Infinity,
      },
    );
  }, [events]);

  return {
    events,
    axes,
    interval,
    toggleCollapse,
  };
};
