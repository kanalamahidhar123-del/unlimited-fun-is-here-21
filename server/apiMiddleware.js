import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from './paymentHandler.js';

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({ parsed: {}, raw: '' });
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve({ parsed, raw: body });
      } catch (err) {
        resolve({ parsed: {}, raw: body });
      }
    });
    req.on('error', (err) => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');
  res.end(JSON.stringify(data));
}

export function paymentApiMiddleware(env = process.env) {
  return async (req, res, next) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');
      res.end();
      return;
    }

    const url = req.url ? req.url.split('?')[0] : '';

    // Route: POST /api/payments/create-order
    if (url === '/api/payments/create-order' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        const orderResult = await createRazorpayOrder(parsed, env);
        sendJson(res, 200, orderResult);
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/payments/verify
    if (url === '/api/payments/verify' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        const verifyResult = verifyPaymentSignature(parsed, env);
        sendJson(res, verifyResult.success ? 200 : 400, verifyResult);
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/payments/webhook
    if (url === '/api/payments/webhook' && req.method === 'POST') {
      try {
        const signature = req.headers['x-razorpay-signature'];
        const { parsed, raw } = await parseJsonBody(req);
        const isValid = verifyWebhookSignature(raw, signature, env);

        if (!isValid) {
          sendJson(res, 400, { status: 'invalid_signature' });
          return;
        }

        console.log('Razorpay Webhook Event Received:', parsed.event);
        sendJson(res, 200, { status: 'ok', event: parsed.event });
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return;
    }

    // Route: GET /api/payments/config
    if (url === '/api/payments/config' && req.method === 'GET') {
      const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TZVDYLey5h8bUz';
      sendJson(res, 200, {
        key_id: keyId,
        has_secret: Boolean(env.RAZORPAY_KEY_SECRET),
        currency: 'INR',
      });
      return;
    }

    if (next) {
      next();
    }
  };
}
