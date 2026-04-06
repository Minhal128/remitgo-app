import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface KYCFailureModalProps {
  visible: boolean;
  onRetry: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
  retryButtonText?: string;
  closeButtonText?: string;
  showSignInButton?: boolean;
  onSignIn?: () => void;
}

const KYCFailureModal: React.FC<KYCFailureModalProps> = ({
  visible,
  onRetry,
  onClose,
  title = "Verification Failed",
  message = "❌ We encountered an issue with your KYC verification. Please review your documents and try again.",
  retryButtonText = "Try Again",
  closeButtonText = "Review Documents",
  showSignInButton = false,
  onSignIn
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      iconScaleAnim.setValue(0);
      shakeAnim.setValue(0);

      // Animate in sequence
      Animated.sequence([
        // Modal fade in with scale
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Error icon bounce in
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        // Subtle shake animation for attention
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleRetry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRetry();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim }
              ],
            }
          ]}
        >
          {/* Error Icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: iconScaleAnim }],
              }
            ]}
          >
            <View style={styles.iconBackground}>
              <MaterialIcons name="error" size={64} color="#F44336" />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color="#FF9800" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Please ensure all photos are clear, well-lit, and show all text clearly.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>{retryButtonText}</Text>
            </TouchableOpacity>

            {showSignInButton && onSignIn && (
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={onSignIn}
                activeOpacity={0.8}
              >
                <Text style={styles.signInButtonText}>Sign In Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>{closeButtonText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 350,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)',
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F44336',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 32,
    width: '100%',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#234881',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(35, 72, 129, 0.3)',
    elevation: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#234881',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#234881',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(220, 38, 38, 0.3)',
    elevation: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export { KYCFailureModal };
export default KYCFailureModal;
