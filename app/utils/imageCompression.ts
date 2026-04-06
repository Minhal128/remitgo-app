import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface CompressionOptions {
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageCompression {
  /**
   * Compress an image to reduce file size
   * @param imageUri - The image URI (file://, data:, or http://)
   * @param options - Compression options
   * @returns Compressed image as base64 string
   */
  static async compressImage(
    imageUri: string, 
    options: CompressionOptions = {}
  ): Promise<string> {
    try {
      const {
        quality = 0.8,
        maxWidth = 1024,
        maxHeight = 1024,
        format = 'jpeg'
      } = options;

      console.log(`🖼️ Compressing image: ${imageUri.substring(0, 50)}...`);
      console.log(`⚙️ Compression options: quality=${quality}, maxSize=${maxWidth}x${maxHeight}, format=${format}`);

      // If it's already a base64 string, try to compress it
      if (imageUri.startsWith('data:image')) {
        return await this.compressBase64Image(imageUri, options);
      }

      // For file URIs, read and compress
      if (imageUri.startsWith('file://')) {
        return await this.compressFileImage(imageUri, options);
      }

      // For network images, download and compress
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        return await this.compressNetworkImage(imageUri, options);
      }

      // Unknown format, return as is
      console.warn('⚠️ Unknown image format, returning original:', imageUri);
      return imageUri;

    } catch (error) {
      console.error('❌ Image compression failed:', error);
      return imageUri; // Return original if compression fails
    }
  }

  /**
   * Compress a base64 image
   */
  private static async compressBase64Image(
    base64Uri: string, 
    options: CompressionOptions
  ): Promise<string> {
    try {
      // Extract the base64 data part
      const base64Data = base64Uri.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 format');
      }

      // Check if we're on web platform
      if (Platform.OS === 'web') {
        // On web, we can't use FileSystem, so we'll use ImageManipulator directly
        // Create a blob from base64 and use it with ImageManipulator
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        // For web, we'll return the original base64 if compression fails
        // This is a limitation of the web platform
        console.log('🌐 Web platform detected, skipping base64 compression');
        return base64Uri;
      }

      // Convert base64 to temporary file (mobile platforms only)
      const tempUri = `${FileSystem.cacheDirectory}temp_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(tempUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Compress the temporary file
      const compressedUri = await this.compressFileImage(tempUri, options);

      // Clean up temporary file
      await FileSystem.deleteAsync(tempUri);

      return compressedUri;

    } catch (error) {
      console.error('Base64 compression failed:', error);
      return base64Uri;
    }
  }

  /**
   * Compress a file image
   */
  private static async compressFileImage(
    fileUri: string, 
    options: CompressionOptions
  ): Promise<string> {
    try {
      const {
        quality = 0.8,
        maxWidth = 1024,
        maxHeight = 1024,
        format = 'jpeg'
      } = options;

      // Get image info
      const imageInfo = await ImageManipulator.manipulateAsync(
        fileUri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight
            }
          }
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(imageInfo.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const compressedUri = `data:${mimeType};base64,${base64}`;

      console.log(`✅ Image compressed: ${fileUri} -> ${compressedUri.length} chars`);
      return compressedUri;

    } catch (error) {
      console.error('File compression failed:', error);
      return fileUri;
    }
  }

  /**
   * Compress a network image
   */
  private static async compressNetworkImage(
    networkUri: string, 
    options: CompressionOptions
  ): Promise<string> {
    try {
      // Download the image first
      const downloadResult = await FileSystem.downloadAsync(
        networkUri,
        `${FileSystem.cacheDirectory}temp_network_${Date.now()}.jpg`
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Failed to download image: ${downloadResult.status}`);
      }

      // Compress the downloaded file
      const compressedUri = await this.compressFileImage(downloadResult.uri, options);

      // Clean up downloaded file
      await FileSystem.deleteAsync(downloadResult.uri);

      return compressedUri;

    } catch (error) {
      console.error('Network image compression failed:', error);
      return networkUri;
    }
  }

  /**
   * Get estimated file size from base64 string
   */
  static getBase64Size(base64String: string): number {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      
      // Calculate size: base64 is 4/3 of original size
      const sizeInBytes = (base64Data.length * 3) / 4;
      return sizeInBytes;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if image needs compression
   */
  static shouldCompress(base64String: string, maxSizeMB: number = 5): boolean {
    const sizeInBytes = this.getBase64Size(base64String);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    return sizeInMB > maxSizeMB;
  }

  /**
   * Batch compress multiple images
   */
  static async compressImages(
    images: string[], 
    options: CompressionOptions = {}
  ): Promise<string[]> {
    try {
      console.log(`🔄 Batch compressing ${images.length} images...`);
      
      const compressedImages = await Promise.all(
        images.map(image => this.compressImage(image, options))
      );

      console.log(`✅ Batch compression completed`);
      return compressedImages;

    } catch (error) {
      console.error('Batch compression failed:', error);
      return images; // Return originals if batch compression fails
    }
  }
}

export default ImageCompression;