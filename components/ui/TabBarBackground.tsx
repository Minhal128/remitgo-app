import { Platform, StyleSheet, View } from 'react-native';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function WebTabBarBackground() {
  return (
    <View style={styles.background} />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
    }),
  },
});

export function useBottomTabOverflow() {
  return 0;
}
