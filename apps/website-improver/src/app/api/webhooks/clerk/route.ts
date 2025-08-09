import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUserCredits } from '@/lib/user-service';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
}

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Error occurred -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error occurred', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, created_at } = evt.data;
      
      try {
        // Create user record with free tier credits
        await createUser({
          id,
          email: email_addresses[0]?.email_address || '',
          createdAt: new Date(created_at),
          plan: 'free',
          credits: 5, // Free tier credits
        });

        console.log(`User created: ${id} with 5 free credits`);
      } catch (error) {
        console.error('Error creating user:', error);
        return new NextResponse('Error creating user', { status: 500 });
      }
    }

    if (eventType === 'user.updated') {
      const { id } = evt.data;
      
      try {
        // Handle any user updates if needed
        console.log(`User updated: ${id}`);
      } catch (error) {
        console.error('Error updating user:', error);
        return new NextResponse('Error updating user', { status: 500 });
      }
    }

    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}