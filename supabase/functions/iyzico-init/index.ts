// Supabase Edge Function — initializes an İyzico Checkout Form session.
// The İyzico secret key NEVER reaches the browser; it only lives here as a
// server-side environment secret (set via `supabase secrets set`).
//
// Deploy:   supabase functions deploy iyzico-init
// Secrets:  supabase secrets set IYZICO_API_KEY=... IYZICO_SECRET_KEY=... IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
//           supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
//           SITE_URL=https://missbeybisi.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const IYZICO_API_KEY    = Deno.env.get('IYZICO_API_KEY')!;
const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY')!;
const IYZICO_BASE_URL   = Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://missbeybisi.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
  const authorization = `IYZWSv2 ${btoa(authString)}`;
  return { Authorization: authorization, 'x-iyzi-rnd': rnd };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const { orderId, customer, items, total } = body;

    if (!orderId || !customer || !items?.length || !total) {
      return new Response(JSON.stringify({ error: 'Eksik parametre' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify the order actually exists and matches the claimed total (prevents tampering).
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Sipariş bulunamadı' }), {
        status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    if (Number(order.total_amount).toFixed(2) !== Number(total).toFixed(2)) {
      return new Response(JSON.stringify({ error: 'Tutar uyuşmazlığı' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const uriPath = '/payment/iyzipos/checkoutform/initialize/auth/ecom';
    const nameParts = customer.name.trim().split(' ');
    const surname = nameParts.length > 1 ? nameParts.pop() : 'Müşteri';
    const name = nameParts.join(' ') || customer.name;

    const iyzicoPayload = {
      locale: 'tr',
      conversationId: orderId,
      price: total.toFixed(2),
      paidPrice: total.toFixed(2),
      currency: 'TRY',
      basketId: orderId,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${SUPABASE_URL}/functions/v1/iyzico-callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: orderId,
        name,
        surname,
        gsmNumber: customer.phone || '+905000000000',
        email: customer.email,
        identityNumber: '11111111111',
        registrationAddress: customer.address,
        city: customer.city,
        country: 'Turkey',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || '85.34.78.112',
      },
      shippingAddress: {
        contactName: customer.name,
        city: customer.city,
        country: 'Turkey',
        address: customer.address,
      },
      billingAddress: {
        contactName: customer.name,
        city: customer.city,
        country: 'Turkey',
        address: customer.address,
      },
      basketItems: items.map((it: any, i: number) => ({
        id: it.product_id || `item-${i}`,
        name: it.product_name,
        category1: 'Çocuk Giyim',
        itemType: 'PHYSICAL',
        price: Number(it.total).toFixed(2),
      })),
    };

    const requestBody = JSON.stringify(iyzicoPayload);
    const authHeaders = await iyzicoAuthHeader(uriPath, requestBody);

    const iyzicoRes = await fetch(`${IYZICO_BASE_URL}${uriPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: requestBody,
    });

    const iyzicoData = await iyzicoRes.json();

    if (iyzicoData.status !== 'success') {
      return new Response(JSON.stringify({ error: iyzicoData.errorMessage || 'İyzico hatası' }), {
        status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('orders').update({ iyzico_token: iyzicoData.token }).eq('id', orderId);

    return new Response(JSON.stringify({ token: iyzicoData.token, checkoutFormContent: iyzicoData.checkoutFormContent }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
