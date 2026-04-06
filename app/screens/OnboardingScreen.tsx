import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const SPACER_WIDTH = (width - ITEM_WIDTH) / 2;

const onboardingData = [
  {
    title: 'Reliable transfers',
    description: 'With RemitGo you get reliable transfers\n every time you send money back home.',
    image: require('../../assets/images/pix1.png'),
  },
  {
    title: 'Get regular updates',
    description: 'With RemitGo you and your loved ones\n can track your money every step of the way.',
    image: require('../../assets/images/pix2.png'),
  },
  {
    title: 'Track transactions',
    description: 'Easily view, manage and track all\n your previous transfers anytime.',
    image: require('../../assets/images/pix3.png'),
  },
];

const Boarding: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any>>(null);

  const dataWithSpacers = [
    { key: 'left-spacer' },
    ...onboardingData.map((item, idx) => ({ ...item, key: idx.toString() })),
    { key: 'right-spacer' },
  ];

  const onMomentumScrollEnd = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    let index = Math.round(contentOffsetX / ITEM_WIDTH);
    const virtualIndex = index - 1; // adjust for left spacer
    if (virtualIndex >= 0 && virtualIndex < onboardingData.length) {
      setActiveIndex(virtualIndex);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.key === 'left-spacer' || item.key === 'right-spacer') {
      return <View style={{ width: SPACER_WIDTH }} />;
    }
    const inputRange = [
      (index - 2) * ITEM_WIDTH,
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.slide, { transform: [{ scale }] }]}> 
        <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity>
          <MaterialIcons name="language" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="help-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.carouselSection}>
        <FlatList
          ref={flatListRef}
          data={dataWithSpacers}
          renderItem={renderItem}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          contentContainerStyle={styles.carouselContainer}
          style={styles.carouselStyle}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          initialScrollIndex={1}
        />
      </View>
      <View style={styles.contentSection}>
        <Text style={styles.title}>{onboardingData[activeIndex].title}</Text>
        <Text style={styles.subtitle}>{onboardingData[activeIndex].description}</Text>
      </View>
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === activeIndex ? '#234881' : '#E5E5EA',
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/screens/ChooseCountryScreen')}
        >
          <Text style={styles.primaryButtonText}>Create a new profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/screens/signin')}
        >
          <Text style={styles.secondaryButtonText}>I already have a profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  carouselSection: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselStyle: {
    width: '100%',
    flexGrow: 0,
  },
  slide: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: ITEM_WIDTH * 0.9,
    height: ITEM_WIDTH * 0.6,
    borderRadius: 12,
  },
  contentSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: -32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#234881',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 5,
      },
    }),
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#222',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 8,
    opacity: 1,
  },
});

export default Boarding;

export const config = {
  headerShown: false,
}; 