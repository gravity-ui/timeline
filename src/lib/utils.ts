

export function isMac() {
  return navigator.userAgent.indexOf("Mac OS") !== -1;
}

export type CommandKey =  "meta" | "ctrl";
export function getControlCommandKey(): CommandKey {
  return isMac() ? "meta" : "ctrl";
}

export function checkControlCommandKey(event: MouseEvent | KeyboardEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

export const noop = () => {};
