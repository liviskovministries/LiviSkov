'use client';

import React, { ReactNode } from 'react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Este componente agora é apenas um placeholder vazio since estamos usando Supabase
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return <>{children}</>;
}