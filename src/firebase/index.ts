'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: MODIFIED TO USE EXPLICIT CONFIG WITH FALLBACK
export function initializeFirebase() {
  if (!getApps().length) {
    try {
      // Try explicit config first
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    } catch (error) {
      console.warn('Firebase explicit config failed, trying automatic initialization...', error);
      
      try {
        // Fallback to automatic initialization for Firebase App Hosting
        const firebaseApp = initializeApp();
        return getSdks(firebaseApp);
      } catch (fallbackError) {
        console.error('Both Firebase initialization methods failed:', fallbackError);
        throw new Error('Failed to initialize Firebase with any method');
      }
    }
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';