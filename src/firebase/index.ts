// Exportações vazias para compatibilidade com componentes existentes
export function initializeFirebase() {
  return {
    firebaseApp: null,
    auth: null,
    firestore: null
  };
}

// Exportações vazias para compatibilidade
export * from './client-provider';