export function isMac() {
  return navigator.userAgent.indexOf("Mac OS") !== -1;
}

export function checkControlCommandKey(event: MouseEvent | KeyboardEvent) {
  return isMac() ? event.metaKey : event.ctrlKey;
}
