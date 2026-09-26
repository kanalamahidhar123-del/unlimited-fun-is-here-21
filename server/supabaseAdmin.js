import { createClient } from '@supabase/supabase-js';

let cachedClient = null;
let lastEnvKey = '';

export function getSupabaseAdminClient(env = process.env) {
  const supabaseUrl =
    env?.SUPABASE_URL ||
    env?.VITE_SUPABASE_URL ||
    process.env?.SUPABASE_URL ||
    process.env?.VITE_SUPABASE_URL ||
    '';

  const supabaseKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    env?.SUPABASE_KEY ||
    env?.SUPABASE_SECRET ||
    env?.VITE_SUPABASE_ANON_KEY ||
    process.env?.SUPABASE_SERVICE_ROLE_KEY ||
    process.env?.SUPABASE_KEY ||
    process.env?.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder.supabase.co')) {
    return null;
  }

  const currentKey = `${supabaseUrl}:${supabaseKey}`;
  if (cachedClient && lastEnvKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    lastEnvKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase Admin client:', err.message);
    return null;
  }
}

/**
 * Fetch ALL customer bookings from Supabase across all emails (no user filtering)
 */
export async function fetchSupabaseBookings(env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch bookings notice:', error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];

    // Map Supabase rows to uniform BookingRecord structure
    return data.map((row) => {
      // Extract custom metadata from special_request if present e.g. [UF-TR-12345]
      const matchId = row.special_request ? row.special_request.match(/\[(UF-[A-Z]+-\d+)\]/) : null;
      const bookingId = matchId ? matchId[1] : (row.booking_id || `UF-TR-${row.id.substring(0, 5).toUpperCase()}`);
      
      const isRfid = row.category === 'RFID' || (row.special_request && row.special_request.includes('RFID'));
      const guestCount = Number(row.number_of_people) || 1;

      return {
        id: row.id,
        booking_id: bookingId,
        type: isRfid ? 'RFID' : 'Trampoline',
        full_name: row.full_name,
        mobile_number: row.mobile_number,
        whatsapp_number: row.mobile_number,
        email: row.email || null,
        visit_date: row.visit_date,
        preferred_time: row.preferred_time,
        adults: guestCount,
        children: 0,
        category: row.category,
        duration: row.duration || '1 Hour',
        quantity: guestCount,
        rfid_card_type: isRfid ? row.category : null,
        price_per_unit: 0,
        booking_amount: 0,
        paid_amount: 0,
        utr: '',
        payment_method: 'Registration Only',
        payment_status: 'Not Required',
        booking_status: (row.status === 'confirmed' ? 'Confirmed' : row.status === 'cancelled' ? 'Cancelled' : 'Registration Received'),
        special_request: row.special_request,
        created_at: row.created_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Supabase fetch bookings exception:', err.message);
    return [];
  }
}

/**
 * Fetch ALL birthday enquiries from Supabase across all customer submissions
 */
export async function fetchSupabaseBirthdayEnquiries(env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('birthday_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch birthday enquiries notice:', error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email || '',
      preferred_date: row.preferred_date || '',
      number_of_guests: row.number_of_guests || 0,
      package_name: row.package_name || 'Birthday Party',
      message: row.message || '',
      status: row.status || 'New',
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Supabase fetch birthday enquiries exception:', err.message);
    return [];
  }
}

/**
 * Insert or sync booking into Supabase
 */
export async function insertSupabaseBooking(booking, env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return null;

  try {
    const payload = {
      full_name: booking.full_name,
      mobile_number: booking.mobile_number,
      email: booking.email || null,
      visit_date: booking.visit_date,
      preferred_time: booking.preferred_time,
      number_of_people: (booking.adults || 0) + (booking.children || 0) || booking.quantity || 1,
      category: booking.category === 'Children' ? 'Children' : 'Adult',
      duration: booking.duration === '2 Hours' ? '2 Hours' : '1 Hour',
      special_request: `[${booking.booking_id}] Method: ${booking.payment_method || 'Registration Only'} | Status: ${booking.booking_status || 'Registration Received'} | ${booking.special_request || ''}`,
      agreed_to_terms: true,
      status: booking.booking_status === 'Confirmed' ? 'confirmed' : booking.booking_status === 'Cancelled' ? 'cancelled' : 'pending',
    };

    const { error } = await client
      .from('bookings')
      .insert(payload);

    if (error) {
      console.warn('Supabase insert booking notice:', error.message);
      return null;
    }
    return payload;
  } catch (err) {
    console.warn('Supabase insert booking exception:', err.message);
    return null;
  }
}

/**
 * Insert or sync birthday enquiry into Supabase
 */
export async function insertSupabaseBirthdayEnquiry(enquiry, env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return null;

  try {
    const payload = {
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email || null,
      preferred_date: enquiry.preferred_date || null,
      number_of_guests: enquiry.number_of_guests ? Number(enquiry.number_of_guests) : null,
      message: enquiry.message || (enquiry.package_name ? `Package: ${enquiry.package_name}` : ''),
      status: enquiry.status || 'pending',
    };

    const { error } = await client
      .from('birthday_enquiries')
      .insert(payload);

    if (error) {
      console.warn('Supabase insert birthday enquiry notice:', error.message);
      return null;
    }
    return payload;
  } catch (err) {
    console.warn('Supabase insert birthday enquiry exception:', err.message);
    return null;
  }
}

/**
 * Delete a booking from Supabase by ID or matching booking_id in special_request
 */
export async function deleteSupabaseBooking(id, env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return false;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await client.from('bookings').delete().eq('id', id);
    } else {
      await client.from('bookings').delete().ilike('special_request', `%${id}%`);
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete booking notice:', err.message);
    return false;
  }
}

/**
 * Delete a birthday enquiry from Supabase
 */
export async function deleteSupabaseBirthdayEnquiry(id, env = process.env) {
  const client = getSupabaseAdminClient(env);
  if (!client) return false;

  try {
    await client.from('birthday_enquiries').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Supabase delete birthday enquiry notice:', err.message);
    return false;
  }
}
