import React, { UIEvent, useMemo } from "react";
import { Flex } from "@gravity-ui/uikit";
import cn from "bem-cn-lite";
import "./EventsList.scss";
import { TimelineEvent } from "../../../types";
import { Timeline } from "../../../Timeline";

type Props<TEvent extends TimelineEvent> = {
  timeline: Timeline<TEvent>;
  items: string[];
  itemHeight: number;
};

const block = cn("event-list-container");

export const EventsList = <TEvent extends TimelineEvent>({
  items,
  itemHeight,
  timeline,
}: Props<TEvent>) => {
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    timeline.api.setCanvasScrollTop(scrollTop);
  };

  const listItems = useMemo(() => {
    return items.map((item) => {
      return (
        <Flex
          className={block("item")}
          alignItems="center"
          justifyContent="center"
          key={item}
          style={{ height: `${itemHeight}px` }}
        >
          {item}
        </Flex>
      );
    });
  }, [itemHeight, items]);

  return (
    <div className={block()} onScroll={handleScroll}>
      {listItems}
    </div>
  );
};
