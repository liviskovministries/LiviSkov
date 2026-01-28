// Arquivo de compatibilidade - Firebase não está mais sendo utilizado
// Mock para evitar erros de importação

export function useUser() {
  console.warn('Firebase não está mais sendo utilizado. Use Supabase.');
  return { user: null, isUserLoading: false, userError: null };
}

export function useFirestore() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function useAuth() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function useFirebaseApp() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function useMemoFirebase(factory: () => any, deps: any[]) {
  console.warn('Firebase não está mais sendo utilizado. Use Supabase.');
  return factory();
}

export function setDocumentNonBlocking() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function addDocumentNonBlocking() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function useCollection() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}

export function useDoc() {
  throw new Error('Firebase não está mais sendo utilizado no projeto. Use Supabase.');
}