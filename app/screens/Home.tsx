import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to HomePage immediately
    router.replace('/screens/HomePage');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#234881" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  }
});
