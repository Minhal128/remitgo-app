import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ColorUtils } from '../constants/Colors';

const { width } = Dimensions.get('window');

const VirtualCard = () => {
  const [showCVV, setShowCVV] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));
  
  const colors = Colors.light;

  const cardData = {
    cardNumber: '4532 **** **** 1234',
    cardholderName: 'JOHN DOE',
    expiryDate: '12/26',
    cvv: '123',
    cardType: 'VISA',
  };

  const toggleCVV = () => {
    setShowCVV(!showCVV);
    Animated.spring(flipAnimation, {
      toValue: showCVV ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Virtual Card
      </Text>
      
      <View style={styles.cardContainer}>
        {/* Front of Card */}
        <Animated.View style={[styles.cardFront, frontAnimatedStyle, { backgroundColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.chip, { backgroundColor: ColorUtils.withOpacity(colors.textInverse, 0.3) }]}>
              <Ionicons name="card" size={20} color={colors.textInverse} />
            </View>
            <View style={[styles.cardType, { backgroundColor: ColorUtils.withOpacity(colors.textInverse, 0.2) }]}>
              <Text style={[styles.cardTypeText, { color: colors.textInverse }]}>
                {cardData.cardType}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.cardNumber, { color: colors.textInverse }]}>
            {cardData.cardNumber}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.cardholderInfo}>
              <Text style={[styles.cardholderLabel, { color: ColorUtils.withOpacity(colors.textInverse, 0.7) }]}>
                CARDHOLDER
              </Text>
              <Text style={[styles.cardholderName, { color: colors.textInverse }]}>
                {cardData.cardholderName}
              </Text>
            </View>
            <View style={styles.expiryInfo}>
              <Text style={[styles.expiryLabel, { color: ColorUtils.withOpacity(colors.textInverse, 0.7) }]}>
                EXPIRES
              </Text>
              <Text style={[styles.expiryDate, { color: colors.textInverse }]}>
                {cardData.expiryDate}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Back of Card */}
        <Animated.View style={[styles.cardBack, backAnimatedStyle, { backgroundColor: colors.primary }]}>
          <View style={styles.magneticStripe} />
          <View style={styles.signaturePanel}>
            <View style={[styles.signatureBox, { backgroundColor: colors.textInverse }]} />
            <View style={styles.cvvSection}>
              <Text style={[styles.cvvLabel, { color: ColorUtils.withOpacity(colors.textInverse, 0.7) }]}>
                CVV
              </Text>
              <TouchableOpacity 
                style={[styles.cvvBox, { backgroundColor: colors.textInverse }]}
                onPress={toggleCVV}
              >
                <Text style={[styles.cvvText, { color: colors.primary }]}>
                  {showCVV ? cardData.cvv : '•••'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Card Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: ColorUtils.withOpacity(colors.primary, 0.1) }]}
          onPress={toggleCVV}
        >
          <Ionicons name="eye" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            {showCVV ? 'Hide CVV' : 'Show CVV'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: ColorUtils.withOpacity(colors.secondary, 0.1) }]}>
          <Ionicons name="copy" size={20} color={colors.secondary} />
          <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
            Copy Number
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardContainer: {
    position: 'relative',
    height: 200,
    marginBottom: 16,
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 8,
      },
    }),
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 8,
      },
    }),
    backfaceVisibility: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardholderInfo: {
    flex: 1,
  },
  cardholderLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardholderName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  magneticStripe: {
    height: 40,
    backgroundColor: '#000',
    borderRadius: 4,
    marginBottom: 20,
  },
  signaturePanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureBox: {
    width: 120,
    height: 30,
    borderRadius: 4,
  },
  cvvSection: {
    alignItems: 'flex-end',
  },
  cvvLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cvvBox: {
    width: 50,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvvText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VirtualCard;
