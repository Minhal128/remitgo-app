import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';

const KYCStartScreen: React.FC = () => {
  const router = useRouter();

  const handleStartKYC = () => {
    router.push('/screens/KYCScreen');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Feather name="arrow-left" size={24} color="#234881" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.iconContainer}>
              <Feather name="shield" size={48} color="#234881" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to KYC Verification</Text>
            <Text style={styles.welcomeSubtitle}>
              Complete your identity verification to unlock all features
            </Text>
          </View>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why Complete KYC?</Text>
            
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Higher transaction limits</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Access to all features</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Enhanced security</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Faster processing</Text>
            </View>
          </View>

          {/* Process Steps Card */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Verification Process</Text>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Personal Information</Text>
                <Text style={styles.stepDescription}>Enter your basic details</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Document Upload</Text>
                <Text style={styles.stepDescription}>Upload ID and selfie photos</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>AI Verification</Text>
                <Text style={styles.stepDescription}>Automatic document verification</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Approval</Text>
                <Text style={styles.stepDescription}>Get verified and start using</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.startButton} onPress={handleStartKYC}>
            <LinearGradient
              colors={['#234881', '#1a365d']}
              style={styles.gradientButton}
            >
              <Feather name="play" size={24} color="white" />
              <Text style={styles.startButtonText}>Start KYC Verification</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Your information is encrypted and secure. This process usually takes 2-5 minutes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#234881',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#234881',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#234881',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  stepsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 3,
      },
    }),
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#234881',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#234881',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#234881',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  startButton: {
    marginBottom: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default KYCStartScreen;
