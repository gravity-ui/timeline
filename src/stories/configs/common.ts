import { TimeLineConfig } from "../../types";

export const commonConfig: Pick<
  TimeLineConfig["settings"],
  "start" | "end" | "axes"
> = {
  start: 1739537126347,
  end: 1739537186347,
  axes: [
    {
      id: "1",
      tracksCount: 5,
      top: 0,
      height: 20,
    },
  ],
};
