'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface StripeCheckoutButtonProps {
  courseId: string;
  userId: string;
  userEmail: string;
}

export function StripeCheckoutButton({ courseId, userId, userEmail }: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          userId,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionUrl } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no checkout',
        description: 'Não foi possível iniciar o processo de pagamento. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      {isLoading ? 'Processando...' : 'Comprar Curso'}
    </Button>
  );
}