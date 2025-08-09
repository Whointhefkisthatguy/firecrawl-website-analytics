// Stripe payment processing utilities

import { loadStripe } from '@stripe/stripe-js';
import { config } from './config';

// Initialize Stripe
export const stripePromise = loadStripe(config.stripe.publishableKey);

/**
 * Create a checkout session for credit purchase
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
}