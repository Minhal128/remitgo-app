import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, FlatList, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const images = [
  require('../assets/images/pix1.png'),
  require('../assets/images/pix2.png'),
  require('../assets/images/pix3.png'),
];

export default function ChooseAppScreen({ navigation }: { navigation: any }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const renderItem = ({ item }: { item: any }) => (
    <Image source={item} style={styles.carouselImage} resizeMode="cover" />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Ionicons name="globe-outline" size={24} color="#222" />
        <Feather name="help-circle" size={24} color="#222" />
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (width - 48));
          setActiveIndex(index);
        }}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={width - 48}
        decelerationRate="fast"
      />

      {/* Page Indicator */}
      <View style={styles.indicatorContainer}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicatorDot,
              activeIndex === idx && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>Reliable transfers</Text>
      <Text style={styles.subtitle}>
        With RemitGo you get reliable transfers{"\n"}every time you send money back home.
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/screens/OnboardingScreen')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Create a new profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/screens/signin')}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>I already have a profile</Text>
      </TouchableOpacity>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: width - 48,
    height: 120,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: '#234881',
    width: 10,
    height: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#234881',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#222',
    fontSize: 17,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#222',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    opacity: 0.9,
  },
});
