class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0) as never;
global.cancelAnimationFrame = (id) => clearTimeout(id);
