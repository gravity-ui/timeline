import React from "react";
import { GravityWrap } from "../GravityWrap";
import { ArrowToggle, Flex, List } from "@gravity-ui/uikit";
import { TimelineCanvas, useTimeline } from "../../../react-components";
import cn from "bem-cn-lite";
import { TestItem } from "./config";
import { useNestedEvents } from "./useNestedEvents";
import "./NestedEvents.scss";

const block = cn("nested-events");

export const NestedEvents = () => {
  const { events, axes, interval, toggleCollapse } = useNestedEvents();
  const { timeline } = useTimeline({
    settings: {
      start: interval.from,
      end: interval.to,
      axes,
      events,
    },
    viewConfiguration: {
      hideRuler: true,
    },
  });

  const handleClick = (item: TestItem) => {
    if ("open" in item) {
      toggleCollapse(item.id);
    }
  };

  return (
    <GravityWrap>
      <div className={block()}>
        <List
          className={block("list")}
          items={events}
          itemHeight={20}
          renderItem={(item) => {
            const { id } = item;
            const showToggle = "open" in item;
            const isOpen = showToggle && item.open;
            const subItem = "subItem" in item;

            return (
              <Flex
                gap={1}
                justifyContent={"space-between"}
                className={block("list-item", { "sub-item": subItem })}
              >
                {id}
                {showToggle && (
                  <ArrowToggle direction={isOpen ? "bottom" : "right"} />
                )}
              </Flex>
            );
          }}
          onItemClick={handleClick}
          filterable={false}
        />
        <TimelineCanvas timeline={timeline} />
      </div>
    </GravityWrap>
  );
};
