const { transform } = require('metro-transform-worker');

// These modules will be replaced with empty objects on web
const MODULES_TO_MOCK = [
  'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo',
  'react-native-maps/lib/MapMarkerNativeComponent',
  'react-native/Libraries/Utilities/codegenNativeCommands'
];

// Custom transform function
module.exports.transform = async function customTransform(props) {
  // Check if the file is one of our problematic modules and if we're targeting web
  if (
    process.env.EXPO_TARGET === 'web' &&
    MODULES_TO_MOCK.some(modulePath => props.filename.includes(modulePath))
  ) {
    // Return an empty module for problematic native modules
    return {
      ...props,
      code: 'module.exports = {};',
    };
  }

  // Otherwise, use the default transform
  return transform(props);
}; 