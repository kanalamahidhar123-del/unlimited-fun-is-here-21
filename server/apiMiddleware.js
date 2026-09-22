import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from './paymentHandler.js';
import {
  getAllBookings,
  addBooking,
  updateBooking,
  deleteBookingById,
  clearBookingsDb,
  isDateFull,
  getDateBookingCount,
  getNextAvailableDate,
  getCapacitySummary,
  DAILY_CAPACITY,
} from './bookingStorage.js';
import {
  getAllAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncementById,
} from './announcementStorage.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');
  res.end(JSON.stringify(data));
}

export function paymentApiMiddleware(env = process.env) {
  return async (req, res, next) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');
      res.end();
      return;
    }

    const url = req.url ? req.url.split('?')[0] : '';
    const searchParams = req.url && req.url.includes('?') ? new URLSearchParams(req.url.split('?')[1]) : new URLSearchParams();

    // Route: GET /api/capacity - Daily 50 booking capacity status & summary
    if (url === '/api/capacity' && req.method === 'GET') {
      try {
        const dateQuery = searchParams.get('date');
        if (dateQuery) {
          const booked = getDateBookingCount(dateQuery);
          const isFull = isDateFull(dateQuery);
          sendJson(res, 200, {
            success: true,
            date: dateQuery,
            capacity: DAILY_CAPACITY,
            booked,
            remaining: Math.max(0, DAILY_CAPACITY - booked),
            isFull,
            nextAvailableDate: isFull ? getNextAvailableDate(dateQuery) : null,
          });
          return;
        }

        const days = parseInt(searchParams.get('days')) || 30;
        const summary = getCapacitySummary(days);
        const nextAvailable = getNextAvailableDate();
        sendJson(res, 200, {
          success: true,
          capacity: DAILY_CAPACITY,
          summary,
          nextAvailableDate: nextAvailable,
        });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: GET /api/announcements - Customer & Admin Announcements
    if (url === '/api/announcements' && req.method === 'GET') {
      try {
        const includeDrafts = searchParams.get('includeDrafts') === 'true';
        const list = getAllAnnouncements(includeDrafts);
        sendJson(res, 200, { success: true, count: list.length, data: list });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message, data: [] });
      }
      return;
    }

    // Route: POST /api/announcements - Create Announcement
    if (url === '/api/announcements' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        if (!parsed || !parsed.title) {
          sendJson(res, 400, { success: false, error: 'Title is required for announcement' });
          return;
        }
        const created = addAnnouncement(parsed);
        sendJson(res, 201, { success: true, data: created });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/announcements/update - Update Announcement
    if (url === '/api/announcements/update' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        if (!parsed || !parsed.id) {
          sendJson(res, 400, { success: false, error: 'ID is required to update announcement' });
          return;
        }
        const updated = updateAnnouncement(parsed.id, parsed);
        if (!updated) {
          sendJson(res, 404, { success: false, error: 'Announcement not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/announcements/delete - Delete Announcement
    if (url === '/api/announcements/delete' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        if (!parsed || !parsed.id) {
          sendJson(res, 400, { success: false, error: 'ID is required to delete announcement' });
          return;
        }
        const deleted = deleteAnnouncementById(parsed.id);
        sendJson(res, 200, { success: deleted });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: GET /api/bookings - Fetch ALL customer bookings across all emails
    if (url === '/api/bookings' && req.method === 'GET') {
      try {
        const bookings = getAllBookings();
        sendJson(res, 200, { success: true, count: bookings.length, data: bookings });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message, data: [] });
      }
      return;
    }

    // Route: POST /api/bookings - Create and save new customer booking (with 50 capacity check)
    if (url === '/api/bookings' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        if (!parsed || (!parsed.booking_id && !parsed.full_name)) {
          sendJson(res, 400, { success: false, error: 'Invalid booking payload' });
          return;
        }

        // Enforce 50 daily capacity check
        if (parsed.visit_date && isDateFull(parsed.visit_date)) {
          const nextDate = getNextAvailableDate(parsed.visit_date);
          sendJson(res, 400, {
            success: false,
            error: 'DATE_FULL',
            message: "Today's tickets are fully booked! Maximum daily capacity of 50 bookings has been reached.",
            nextAvailableDate: nextDate,
          });
          return;
        }

        const saved = addBooking(parsed);
        sendJson(res, 201, { success: true, data: saved });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/bookings/update - Update status of a booking
    if (url === '/api/bookings/update' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        const { id, booking_id, ...updates } = parsed;
        const targetId = id || booking_id;
        const updated = updateBooking(targetId, updates);
        if (!updated) {
          sendJson(res, 404, { success: false, error: 'Booking not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: updated });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/bookings/delete - Delete a booking
    if (url === '/api/bookings/delete' && req.method === 'POST') {
      try {
        const { parsed } = await parseJsonBody(req);
        const targetId = parsed.id || parsed.booking_id;
        const deleted = deleteBookingById(targetId);
        sendJson(res, 200, { success: deleted });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

    // Route: POST /api/bookings/clear - Clear all bookings
    if (url === '/api/bookings/clear' && req.method === 'POST') {
      try {
        clearBookingsDb();
        sendJson(res, 200, { success: true, message: 'All bookings cleared' });
      } catch (err) {
        sendJson(res, 500, { success: false, error: err.message });
      }
      return;
    }

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
