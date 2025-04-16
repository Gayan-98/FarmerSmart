// Web mock for AccessibilityInfo
export default {
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  isScreenReaderEnabled: () => Promise.resolve(false),
  fetch: () => {},
  getRecommendedTimeoutMillis: () => Promise.resolve(0),
  setAccessibilityFocus: () => {}
}; 