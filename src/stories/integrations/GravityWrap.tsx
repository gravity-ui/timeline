import React, { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

export const GravityWrap: FC<PropsWithChildren> = ({ children }) => {
  return <ThemeProvider theme="light">{children}</ThemeProvider>;
};
