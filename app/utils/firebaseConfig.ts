/**
 * Firebase Configuration Stub
 * 
 * Firebase has been removed from this project in favor of Clerk authentication.
 * This file provides stub functions to prevent build errors from legacy code.
 * 
 * TODO: Remove all Firebase dependencies and update Apple/Facebook sign-in to use Clerk
 */

export const getFirebaseAuth = () => {
  console.warn('⚠️ Firebase is no longer used in this project. Please use Clerk for authentication.');
  return null;
};

export const ensureFirebaseAuth = async () => {
  console.warn('⚠️ Firebase is no longer used in this project. Please use Clerk for authentication.');
  return null;
};

export const initializeFirebase = async () => {
  console.warn('⚠️ Firebase is no longer used in this project. Please use Clerk for authentication.');
  return { firebaseApp: null, firebaseAuth: null };
};
