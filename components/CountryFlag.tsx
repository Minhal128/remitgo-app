import React, { useState } from 'react';
import { Image, ImageStyle, View, ViewStyle, Text } from 'react-native';
import { getCountryFlag, getCountryFlagWithSize } from '../assets/images/countryFlags';

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  showFallback?: boolean;
  showCountryCode?: boolean;
}

const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 24,
  style,
  containerStyle,
  showFallback = true,
  showCountryCode = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const flagUrl = getCountryFlagWithSize(countryCode, size);
  
  // Professional fallback when flag fails to load
  const fallbackFlag = (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: '#f3f4f6',
          borderRadius: size * 0.15,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        },
        containerStyle,
      ]}
    >
      {showCountryCode ? (
        <Text
          style={{
            fontSize: size * 0.4,
            fontWeight: '600',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          {countryCode}
        </Text>
      ) : (
        <View
          style={{
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: '#d1d5db',
            borderRadius: size * 0.3,
          }}
        />
      )}
    </View>
  );

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    if (showFallback) {
      console.log(`Failed to load flag for country: ${countryCode}`);
    }
  };

  // Show fallback if image failed to load
  if (imageError) {
    return fallbackFlag;
  }

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri: flagUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.15,
            opacity: imageLoading ? 0.7 : 1,
          },
          style,
        ]}
        resizeMode="cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        defaultSource={showFallback ? undefined : undefined}
      />
      
      {/* Loading indicator */}
      {imageLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f3f4f6',
            borderRadius: size * 0.15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: size * 0.4,
              height: size * 0.4,
              backgroundColor: '#d1d5db',
              borderRadius: size * 0.2,
            }}
          />
        </View>
      )}
    </View>
  );
};

export default CountryFlag;

