import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface KYCResultModalProps {
  visible: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  retryable?: boolean;
  autoCloseDelay?: number;
}

const KYCResultModal: React.FC<KYCResultModalProps> = ({
  visible,
  success,
  message,
  onClose,
  onRetry,
  retryable = false,
  autoCloseDelay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate icon
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }).start();

        // Start progress animation if auto-close is enabled
        if (autoCloseDelay > 0) {
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: autoCloseDelay,
            useNativeDriver: false,
          }).start(() => {
            onClose();
          });
        }
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      iconScaleAnim.setValue(0);
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              success ? styles.successIconContainer : styles.errorIconContainer,
              {
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            {success ? (
              <Feather name="check" size={40} color="#FFFFFF" />
            ) : (
              <MaterialIcons name="error-outline" size={40} color="#FFFFFF" />
            )}
          </Animated.View>

          {/* Title */}
          <Text style={[styles.title, success ? styles.successTitle : styles.errorTitle]}>
            {success ? 'KYC Approved!' : 'KYC Verification Failed'}
          </Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Progress bar for auto-close */}
          {autoCloseDelay > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {success ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                {retryable && onRetry && (
                  <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[
                    styles.primaryButton,
                    retryable && onRetry ? styles.flexButton : undefined,
                  ]} 
                  onPress={handleClose}
                >
                  <Text style={styles.primaryButtonText}>
                    {retryable ? 'Close' : 'Understood'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: Math.min(width - 40, 380),
    maxWidth: '90%',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
    elevation: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  successIconContainer: {
    backgroundColor: '#10B981',
  },
  errorIconContainer: {
    backgroundColor: '#EF4444',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successTitle: {
    color: '#10B981',
  },
  errorTitle: {
    color: '#EF4444',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#234881',
    borderRadius: 2,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#234881',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(35, 72, 129, 0.2)',
    elevation: 4,
  },
  flexButton: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  retryButton: {
    borderWidth: 2,
    borderColor: '#234881',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  retryButtonText: {
    color: '#234881',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export { KYCResultModal };
export default KYCResultModal;
