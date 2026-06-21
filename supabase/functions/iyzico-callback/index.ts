// Supabase Edge Function — İyzico Checkout Form callback.
// İyzico POSTs the payment `token` here once the buyer finishes the hosted
// form. We MUST re-verify the result server-side via the Retrieve Checkout
// Form Result API before trusting it — never trust the redirect alone.
//
// Deploy: supabase functions deploy iyzico-callback --no-verify-jwt
// (must allow anonymous/unauthenticated calls since İyzico calls it directly)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const IYZICO_API_KEY    = Deno.env.get('IYZICO_API_KEY')!;
const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY')!;
const IYZICO_BASE_URL   = Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://missbeybisi.com';

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomKey(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1_000_000_000)}`;
}

async function iyzicoAuthHeader(uriPath: string, requestBody: string) {
  const rnd = randomKey();
  const signature = await hmacSha256Hex(IYZICO_SECRET_KEY, rnd + uriPath + requestBody);
  const authString = `apiKey:${IYZICO_API_KEY}&randomKey:${rnd}&signature:${signature}`;
  return { Authorization: `IYZWSv2 ${btoa(authString)}`, 'x-iyzi-rnd': rnd };
}

Deno.serve(async (req) => {
  try {
    const form = await req.formData();
    const token = form.get('token')?.toString();

    if (!token) {
      return Response.redirect(`${SITE_URL}/order-success.html?error=missing_token`, 302);
    }

    const uriPath = '/payment/iyzipos/checkoutform/auth/ecom/detail';
    const requestBody = JSON.stringify({ locale: 'tr', token });
    const authHeaders = await iyzicoAuthHeader(uriPath, requestBody);

    const iyzicoRes = await fetch(`${IYZICO_BASE_URL}${uriPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: requestBody,
    });
    const result = await iyzicoRes.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const orderId = result.conversationId || result.basketId;

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      await supabase.from('orders').update({
        payment_status: 'paid',
        status: 'paid',
        iyzico_payment_id: result.paymentId,
      }).eq('id', orderId);

      await supabase.from('payments').insert({
        payment_type: 'RECEIVEPAYMENT',
        amount: result.paidPrice,
        currency: 'TRY',
        order_id: orderId,
        payment_method: 'IYZICO',
        description: `İyzico ödeme — payment_id: ${result.paymentId}`,
      });

      return Response.redirect(`${SITE_URL}/order-success.html?id=${orderId}&method=iyzico`, 302);
    }

    await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);
    return Response.redirect(`${SITE_URL}/checkout.html?error=payment_failed`, 302);

  } catch (err) {
    console.error(err);
    return Response.redirect(`${SITE_URL}/checkout.html?error=server_error`, 302);
  }
});
