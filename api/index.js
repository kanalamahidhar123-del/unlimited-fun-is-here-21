import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://hcjgxuumdqaigtlejakp.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variable');
}

function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-razorpay-signature');
}

function sendJson(res, status, payload) {
  setCors(res);
  res.status(status).json(payload);
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (!req.body) return {};
  try {
    return JSON.parse(req.body);
  } catch (e) {
    return {};
  }
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = req.url || '';
  const pathname = url.split('?')[0].replace(/^\/api/, '');
  const body = parseBody(req);
  const supabase = getSupabaseClient();

  try {
    // ==========================================
    // 1. /api/bookings routes
    // ==========================================
    if (pathname === '/bookings' || pathname === '/bookings/' || pathname === '') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch bookings error:', error);
          return sendJson(res, 500, { success: false, error: error.message, data: [] });
        }

        const formatted = (data || []).map((row) => {
          const matchId = row.special_request ? row.special_request.match(/\[(UF-[A-Z]+-\d+)\]/) : null;
          const bookingId = matchId ? matchId[1] : (row.booking_id || `UF-TR-${row.id.substring(0, 5).toUpperCase()}`);
          const guestCount = Number(row.number_of_people) || 1;

          return {
            id: row.id,
            booking_id: bookingId,
            type: 'Trampoline',
            full_name: row.full_name,
            mobile_number: row.mobile_number,
            whatsapp_number: row.mobile_number,
            email: row.email || null,
            visit_date: row.visit_date,
            preferred_time: row.preferred_time,
            adults: guestCount,
            children: 0,
            category: row.category || 'Trampoline Park',
            duration: row.duration || '1 Hour',
            quantity: guestCount,
            rfid_card_type: 'None',
            price_per_unit: 0,
            booking_amount: 0,
            paid_amount: 0,
            utr: '',
            payment_method: 'Registration Only',
            payment_status: 'Not Required',
            booking_status: row.status === 'confirmed' ? 'Confirmed' : row.status === 'cancelled' ? 'Cancelled' : 'Pending',
            special_request: row.special_request,
            created_at: row.created_at || new Date().toISOString(),
          };
        });

        return sendJson(res, 200, { success: true, count: formatted.length, data: formatted });
      }

      if (req.method === 'POST') {
        const guestCount = (body.adults || 0) + (body.children || 0) || body.quantity || 1;
        const catVal = body.category || 'Trampoline Park';
        const durVal = body.duration || '1 Hour';
        const statusVal = body.booking_status === 'Confirmed' ? 'confirmed' : body.booking_status === 'Cancelled' ? 'cancelled' : 'pending';

        const payload = {
          full_name: body.full_name,
          mobile_number: body.mobile_number,
          email: body.email || null,
          visit_date: body.visit_date,
          preferred_time: body.preferred_time,
          number_of_people: guestCount,
          category: catVal,
          duration: durVal,
          special_request: body.special_request ? `[${body.booking_id}] ${body.special_request}` : `[${body.booking_id}]`,
          agreed_to_terms: true,
          status: statusVal,
        };

        const { error } = await supabase.from('bookings').insert(payload);
        if (error) {
          console.error('Supabase insert booking error:', error);
          return sendJson(res, 500, { success: false, error: error.message });
        }

        return sendJson(res, 201, { success: true, data: payload });
      }
    }

    if (pathname === '/bookings/update' && req.method === 'POST') {
      const { id, booking_id, booking_status } = body;
      const targetId = id || booking_id;
      const statusVal = booking_status === 'Confirmed' ? 'confirmed' : booking_status === 'Cancelled' ? 'cancelled' : 'pending';

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      if (isUuid) {
        await supabase.from('bookings').update({ status: statusVal }).eq('id', targetId);
      } else {
        await supabase.from('bookings').update({ status: statusVal }).ilike('special_request', `%${targetId}%`);
      }

      return sendJson(res, 200, { success: true });
    }

    if (pathname === '/bookings/delete' && req.method === 'POST') {
      const { id } = body;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('bookings').delete().eq('id', id);
      } else {
        await supabase.from('bookings').delete().ilike('special_request', `%${id}%`);
      }

      return sendJson(res, 200, { success: true });
    }

    // ==========================================
    // 2. /api/birthday-enquiries routes
    // ==========================================
    if (pathname === '/birthday-enquiries' || pathname === '/birthday-enquiries/') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('birthday_enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch birthday enquiries error:', error);
          return sendJson(res, 500, { success: false, error: error.message, data: [] });
        }

        const formatted = (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email || '',
          preferred_date: row.preferred_date || '',
          number_of_guests: row.number_of_guests || 0,
          package_name: 'Birthday Party Package',
          message: row.message || '',
          status: row.status === 'confirmed' ? 'Confirmed' : row.status === 'cancelled' ? 'Cancelled' : 'New',
          created_at: row.created_at || new Date().toISOString(),
        }));

        return sendJson(res, 200, { success: true, count: formatted.length, data: formatted });
      }

      if (req.method === 'POST') {
        const payload = {
          name: body.name,
          phone: body.phone,
          email: body.email || null,
          preferred_date: body.preferred_date || null,
          number_of_guests: body.number_of_guests ? Number(body.number_of_guests) : null,
          message: body.message || (body.package_name ? `Package: ${body.package_name}` : null),
          status: 'pending',
        };

        const { error } = await supabase.from('birthday_enquiries').insert(payload);
        if (error) {
          console.error('Supabase insert birthday enquiry error:', error);
          return sendJson(res, 500, { success: false, error: error.message });
        }

        return sendJson(res, 201, { success: true, data: payload });
      }
    }

    if (pathname === '/birthday-enquiries/update' && req.method === 'POST') {
      const { id, status } = body;
      const statusVal = status === 'Confirmed' ? 'confirmed' : status === 'Cancelled' ? 'cancelled' : 'contacted';
      await supabase.from('birthday_enquiries').update({ status: statusVal }).eq('id', id);
      return sendJson(res, 200, { success: true });
    }

    if (pathname === '/birthday-enquiries/delete' && req.method === 'POST') {
      const { id } = body;
      await supabase.from('birthday_enquiries').delete().eq('id', id);
      return sendJson(res, 200, { success: true });
    }

    // ==========================================
    // 3. /api/capacity & date management
    // ==========================================
    if (pathname === '/capacity' || pathname === '/capacity/') {
      return sendJson(res, 200, {
        success: true,
        capacity: 300,
        summary: [],
        nextAvailableDates: [],
      });
    }

    // Default fallback
    return sendJson(res, 200, { success: true, message: 'Unlimited Fun API Live' });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { success: false, error: err.message });
  }
}
