import '@testing-library/jest-dom'

// Mock ResizeObserver for recharts
// @ts-expect-error - global is available in vitest
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
