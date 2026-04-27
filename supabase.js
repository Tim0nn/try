// Supabase client setup. Uses the official client when available and a small
// REST/Auth fallback when CDN scripts are blocked.
const supabaseUrl = 'https://zyaadswbpfnnbnzucinl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWFkc3dicGZubmJuenVjaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDgzNzIsImV4cCI6MjA4OTE4NDM3Mn0.vqop1nUIUDUWzlerYkfE3t6qnBs9TeQLL3VXsTQXWLQ';

const SUPABASE_AUTH_STORAGE_KEY = 'dragon-supabase-session';
const SUPABASE_PROXY_PRODUCTS_URL = '/api/products';
const SUPABASE_TEMPORARY_UNAVAILABLE = 'Products temporarily unavailable. Please try again.';

const logSupabaseResult = (data, error) => {
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
};

const getStoredSession = () => {
  try {
    const direct = JSON.parse(window.localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY) || 'null');
    if (direct?.access_token) return direct;
    const legacy = JSON.parse(window.localStorage.getItem('sb-zyaadswbpfnnbnzucinl-auth-token') || 'null');
    return normalizeAuthSession(legacy);
  } catch {
    return null;
  }
};

const setStoredSession = (session) => {
  try {
    if (session) window.localStorage.setItem(SUPABASE_AUTH_STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
  } catch {}
};

const normalizeAuthSession = (raw) => {
  if (!raw) return null;
  const expiresIn = Number(raw.expires_in) || 3600;
  return {
    access_token: raw.access_token || raw.session?.access_token || '',
    refresh_token: raw.refresh_token || raw.session?.refresh_token || '',
    expires_at: raw.expires_at || Math.floor(Date.now() / 1000) + expiresIn,
    user: raw.user || raw.session?.user || null
  };
};

const createFallbackSupabaseClient = (url, key) => {
  const baseHeaders = {
    apikey: key,
    'Content-Type': 'application/json'
  };
  const getAuthorizationHeader = () => {
    const session = getStoredSession();
    return session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${key}`;
  };
  const requestJson = async (endpoint, options = {}) => {
    const response = await fetch(`${url}${endpoint}`, {
      ...options,
      headers: {
        ...baseHeaders,
        Authorization: getAuthorizationHeader(),
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    if (!response.ok) {
      const message = body?.message || body?.error_description || body?.error || response.statusText || 'Supabase request failed';
      return { data: null, error: { message, status: response.status, details: body } };
    }
    return { data: body, error: null };
  };
  const encodeFilterValue = (value) => encodeURIComponent(String(value));

  class RestQuery {
    constructor(table) {
      this.table = table;
      this.method = 'GET';
      this.body = undefined;
      this.selectColumns = '*';
      this.filters = [];
      this.orders = [];
      this.singleMode = null;
      this.onConflict = '';
      this.upsertMode = false;
    }
    select(columns = '*') {
      this.selectColumns = columns || '*';
      return this;
    }
    order(column, options = {}) {
      this.orders.push(`${column}.${options.ascending === false ? 'desc' : 'asc'}`);
      return this;
    }
    eq(column, value) {
      this.filters.push([column, `eq.${encodeFilterValue(value)}`]);
      return this;
    }
    in(column, values = []) {
      const encoded = (Array.isArray(values) ? values : []).map((value) => String(value).replace(/"/g, '\\"')).join(',');
      this.filters.push([column, `in.(${encoded})`]);
      return this;
    }
    maybeSingle() {
      this.singleMode = 'maybe';
      return this;
    }
    single() {
      this.singleMode = 'single';
      return this;
    }
    insert(rows) {
      this.method = 'POST';
      this.body = rows;
      return this;
    }
    update(patch) {
      this.method = 'PATCH';
      this.body = patch;
      return this;
    }
    delete() {
      this.method = 'DELETE';
      return this;
    }
    upsert(payload, options = {}) {
      this.method = 'POST';
      this.body = payload;
      this.onConflict = options.onConflict || '';
      this.upsertMode = true;
      return this;
    }
    buildEndpoint() {
      const params = new URLSearchParams();
      params.set('select', this.selectColumns || '*');
      this.filters.forEach(([column, filter]) => params.append(column, filter));
      if (this.orders.length) params.set('order', this.orders.join(','));
      if (this.onConflict) params.set('on_conflict', this.onConflict);
      return `/rest/v1/${this.table}?${params.toString()}`;
    }
    async execute() {
      const headers = { Prefer: this.upsertMode ? 'resolution=merge-duplicates,return=representation' : 'return=representation' };
      const result = await requestJson(this.buildEndpoint(), {
        method: this.method,
        headers,
        body: this.body === undefined ? undefined : JSON.stringify(this.body)
      });
      if (result.error) return result;
      let data = result.data;
      if (this.singleMode) {
        if (Array.isArray(data)) data = data[0] || null;
        if (this.singleMode === 'single' && !data) return { data: null, error: { message: 'No rows returned', status: 406 } };
      }
      return { data, error: null };
    }
    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }
  }

  const auth = {
    async getUser() {
      let session = getStoredSession();
      if (!session?.access_token) return { data: { user: null }, error: null };
      if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000) + 30 && session.refresh_token) {
        const refreshed = await this.refreshSession();
        if (!refreshed.error) session = getStoredSession();
      }
      const result = await requestJson('/auth/v1/user', { method: 'GET' });
      if (result.error) {
        console.warn('Auth error:', result.error);
        return { data: { user: null }, error: result.error };
      }
      session = { ...session, user: result.data };
      setStoredSession(session);
      return { data: { user: result.data }, error: null };
    },
    async refreshSession() {
      const session = getStoredSession();
      if (!session?.refresh_token) return { data: { session: null }, error: null };
      const result = await requestJson('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      if (result.error) {
        console.warn('Auth error:', result.error);
        setStoredSession(null);
        return { data: { session: null }, error: result.error };
      }
      const nextSession = normalizeAuthSession(result.data);
      setStoredSession(nextSession);
      return { data: { session: nextSession, user: nextSession?.user || null }, error: null };
    },
    async signUp({ email, password, options = {} }) {
      const result = await requestJson('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, data: options.data || {} })
      });
      if (result.error) return { data: null, error: result.error };
      const session = normalizeAuthSession(result.data);
      if (session?.access_token) setStoredSession(session);
      return { data: { ...result.data, session, user: result.data?.user || session?.user || null }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const result = await requestJson('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (result.error) return { data: null, error: result.error };
      const session = normalizeAuthSession(result.data);
      setStoredSession(session);
      return { data: { ...result.data, session, user: result.data?.user || session?.user || null }, error: null };
    },
    async signOut() {
      const session = getStoredSession();
      const result = session?.access_token ? await requestJson('/auth/v1/logout', { method: 'POST' }) : { data: null, error: null };
      setStoredSession(null);
      return result.error ? { error: result.error } : { error: null };
    },
    onAuthStateChange(callback) {
      callback?.('INITIAL_SESSION', { user: getStoredSession()?.user || null });
      return { data: { subscription: { unsubscribe() {} } } };
    }
  };

  return {
    from(table) {
      return new RestQuery(table);
    },
    auth,
    functions: {
      async invoke(name, { body } = {}) {
        return requestJson(`/functions/v1/${name}`, {
          method: 'POST',
          body: JSON.stringify(body || {})
        });
      }
    },
    channel() {
      return {
        on() {
          return this;
        },
        subscribe() {
          return this;
        }
      };
    },
    async removeChannel() {}
  };
};

const createSupabaseClient = () => {
  const options = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  };
  if (window.supabase?.createClient) return window.supabase.createClient(supabaseUrl, supabaseKey, options);
  console.warn('Supabase JS library was not loaded. Using REST fallback client.');
  return createFallbackSupabaseClient(supabaseUrl, supabaseKey);
};

const supabaseClient = createSupabaseClient();

const safeGetAuthUser = async () => {
  if (!supabaseClient?.auth?.getUser) return null;
  const { data, error } = await supabaseClient.auth.getUser();
  logSupabaseResult(data, error);
  if (error) {
    console.warn('Auth error:', error);
    return null;
  }
  return data?.user || null;
};

const toDbId = (id) => {
  const raw = id === undefined || id === null ? '' : String(id).trim();
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
};

const buildQtyMap = (items = []) => {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = item?.id === undefined || item?.id === null ? '' : String(item.id).trim();
    const qty = Number(item?.quantity ?? item?.qty ?? 0);
    if (!key || !Number.isFinite(qty) || qty <= 0) return;
    map.set(key, (map.get(key) || 0) + qty);
  });
  return map;
};

const parseGalleryValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  const raw = String(value || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch {}
  if (raw.includes('data:image')) {
    return raw
      .split(/\r?\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return raw
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseBooleanValue = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const raw = String(value ?? '').trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
};

const parseListValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  const raw = String(value || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch {}
  return raw
    .split(/[\r\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapProduct = (p) => {
  const tags = Array.isArray(p.tags)
    ? p.tags
    : p.tags
    ? String(p.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const gallery = parseGalleryValue(p.gallery_images);
  const materials = parseListValue(p.materials);
  const certifications = parseListValue(p.certifications);
  const rawQty = p.quantity ?? p.stock ?? 0;
  const quantity = Number.isFinite(Number(rawQty)) ? Number(rawQty) : 0;
  return {
    id: p.id != null ? String(p.id) : String(Date.now()),
    name: p.name,
    price: Number(p.price) || 0,
    old_price: Number(p.old_price) || null,
    rating: Number(p.rating) || 0,
    reviews_count: Number(p.reviews_count) || 0,
    color: p.color || '',
    type: p.type || '',
    transport_type: p.transport_type || '',
    control_type: p.control_type || '',
    features: p.features || '',
    image: p.image_url || '',
    gallery_images: gallery,
    model_url: p.model_url || '',
    show_3d: parseBooleanValue(p.show_3d),
    desc: p.description || '',
    country: p.country || '',
    size: p.size || '',
    base_pricing_region: p.base_pricing_region || 'eurasia',
    regional_prices: p.regional_prices || {},
    age_rating: p.age_rating || '',
    materials,
    certifications,
    safety_warnings: p.safety_warnings || '',
    tags,
    quantity,
    category: p.category || 'General',
    created_at: p.created_at || ''
  };
};

async function fetchProductsDb() {
  try {
    const proxyResponse = await fetch(SUPABASE_PROXY_PRODUCTS_URL, { headers: { Accept: 'application/json' } });
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      const rows = Array.isArray(proxyData) ? proxyData : proxyData?.products || proxyData?.data || [];
      logSupabaseResult(rows, null);
      return rows.map(mapProduct);
    }
  } catch (proxyError) {
    console.warn('Products proxy unavailable, falling back to Supabase:', proxyError);
  }
  const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: true });
  logSupabaseResult(data, error);
  if (error) throw new Error(SUPABASE_TEMPORARY_UNAVAILABLE);
  return (data || []).map(mapProduct);
}

async function fetchProductsByIdsDb(ids = []) {
  const normalizedIds = Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => toDbId(id))
        .filter((id) => id !== '' && id !== null && id !== undefined)
    )
  );
  if (!normalizedIds.length) return [];
  try {
    const params = new URLSearchParams({ ids: normalizedIds.map(String).join(',') });
    const proxyResponse = await fetch(`${SUPABASE_PROXY_PRODUCTS_URL}?${params.toString()}`, { headers: { Accept: 'application/json' } });
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      const rows = Array.isArray(proxyData) ? proxyData : proxyData?.products || proxyData?.data || [];
      logSupabaseResult(rows, null);
      return rows.map(mapProduct);
    }
  } catch (proxyError) {
    console.warn('Products proxy unavailable, falling back to Supabase:', proxyError);
  }
  const { data, error } = await supabaseClient.from('products').select('*').in('id', normalizedIds);
  logSupabaseResult(data, error);
  if (error) throw new Error(SUPABASE_TEMPORARY_UNAVAILABLE);
  return (data || []).map(mapProduct);
}

const mapOrder = (order) => ({
  id: order.id,
  user_email: order.user_email || '',
  user_name: order.user_name || '',
  items: Array.isArray(order.items) ? order.items : [],
  total: Number(order.total) || 0,
  currency: order.currency || 'RUB',
  pricing_region: order.pricing_region || '',
  address: order.address || '',
  payment_method: order.payment_method || '',
  payment_status: order.payment_status || 'pending',
  status: order.status || 'pending',
  created_at: order.created_at || ''
});

const mapSupportMessage = (row) => ({
  id: row.id != null ? String(row.id) : String(Date.now()),
  source: row.source || 'support',
  user_email: row.user_email || '',
  user_name: row.user_name || '',
  product_id: row.product_id != null ? String(row.product_id) : '',
  product_name: row.product_name || '',
  message: row.message || '',
  answer: row.answer || '',
  status: row.status || 'new',
  created_at: row.created_at || '',
  answered_at: row.answered_at || ''
});

const mapReview = (row) => ({
  id: row.id != null ? String(row.id) : String(Date.now()),
  product_id: row.product_id != null ? String(row.product_id) : '',
  user_id: row.user_id || '',
  user_email: row.user_email || '',
  user_name: row.user_name || '',
  rating: Number(row.rating) || 0,
  comment: row.comment || '',
  status: row.status || 'pending',
  created_at: row.created_at || '',
  updated_at: row.updated_at || ''
});

async function fetchOrdersDb(filters = {}) {
  let query = supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  if (filters.user_email) query = query.eq('user_email', filters.user_email);
  const { data, error } = await query;
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapOrder);
}

async function insertOrderDb(order) {
  let payload = { ...order };
  let result = await supabaseClient.from('orders').insert([payload]).select('*');
  console.log('SUPABASE RESPONSE:', result.data);
  console.log('SUPABASE ERROR:', result.error);
  if (result.error && /payment_status/i.test(String(result.error.message || ''))) {
    const { payment_status, ...fallbackPayload } = payload;
    result = await supabaseClient.from('orders').insert([fallbackPayload]).select('*');
    console.log('SUPABASE RESPONSE:', result.data);
    console.log('SUPABASE ERROR:', result.error);
  }
  if (result.error) throw result.error;
  return (result.data || []).map(mapOrder);
}

async function updateOrderStatusDb(id, status) {
  const { data, error } = await supabaseClient.from('orders').update({ status }).eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapOrder);
}

async function updateOrderPaymentDb(id, patch = {}) {
  const basePatch = {
    payment_method: patch.payment_method,
    payment_status: patch.payment_status,
    status: patch.status
  };
  const cleanPatch = Object.fromEntries(Object.entries(basePatch).filter(([, value]) => value !== undefined));
  let result = await supabaseClient.from('orders').update(cleanPatch).eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', result.data);
  console.log('SUPABASE ERROR:', result.error);
  if (result.error && /payment_status/i.test(String(result.error.message || ''))) {
    const { payment_status, ...fallbackPatch } = cleanPatch;
    result = await supabaseClient.from('orders').update(fallbackPatch).eq('id', id).select('*');
    console.log('SUPABASE RESPONSE:', result.data);
    console.log('SUPABASE ERROR:', result.error);
  }
  if (result.error) throw result.error;
  return (result.data || []).map(mapOrder);
}

async function invokePaymentFunction(name, payload = {}) {
  const { data, error } = await supabaseClient.functions.invoke(name, { body: payload });
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data || null;
}

async function createPaymentIntentDb(payload = {}) {
  return invokePaymentFunction('create-payment-intent', payload);
}

async function confirmPaymentDb(payload = {}) {
  return invokePaymentFunction('confirm-payment', payload);
}

async function secureCheckoutDb(payload = {}) {
  return invokePaymentFunction('secure-checkout', payload);
}

async function fetchSupportMessagesDb() {
  const { data, error } = await supabaseClient.from('support_messages').select('*').order('created_at', { ascending: false });
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapSupportMessage);
}

async function insertSupportMessageDb(payload) {
  const row = {
    source: payload?.source === 'product_question' ? 'product_question' : 'support',
    user_email: String(payload?.user_email || '').trim().toLowerCase(),
    user_name: String(payload?.user_name || '').trim(),
    product_name: String(payload?.product_name || '').trim(),
    message: String(payload?.message || '').trim(),
    answer: String(payload?.answer || '').trim(),
    status: payload?.status === 'answered' ? 'answered' : 'new'
  };
  const rawProductId = payload?.product_id;
  const productIdText = rawProductId === undefined || rawProductId === null ? '' : String(rawProductId).trim();
  if (productIdText) {
    row.product_id = /^-?\d+$/.test(productIdText) ? Number(productIdText) : productIdText;
  }
  const { data, error } = await supabaseClient.from('support_messages').insert([row]).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapSupportMessage);
}

async function updateSupportMessageDb(id, patch) {
  const { data, error } = await supabaseClient.from('support_messages').update(patch).eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapSupportMessage);
}

async function fetchFavoritesDb() {
  const user = await safeGetAuthUser();
  if (!user) return [];

  const { data, error } = await supabaseClient
    .from('user_favorites')
    .select('product_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map((row) => String(row.product_id)).filter(Boolean);
}

async function addFavoriteDb(productId) {
  const user = await safeGetAuthUser();
  if (!user) throw new Error('Authenticated user required for favorites');

  const payload = {
    user_id: user.id,
    product_id: String(productId || '').trim(),
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient
    .from('user_favorites')
    .upsert(payload, { onConflict: 'user_id,product_id' })
    .select('product_id');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map((row) => String(row.product_id)).filter(Boolean);
}

async function removeFavoriteDb(productId) {
  const user = await safeGetAuthUser();
  if (!user) throw new Error('Authenticated user required for favorites');

  const { data, error } = await supabaseClient
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', String(productId || '').trim())
    .select('product_id');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return true;
}

async function fetchReviewsDb(filters = {}) {
  let query = supabaseClient.from('product_reviews').select('*').order('created_at', { ascending: false });
  if (filters.product_id) query = query.eq('product_id', String(filters.product_id));
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  const { data, error } = await query;
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function upsertReviewDb(payload = {}) {
  const user = await safeGetAuthUser();
  if (!user) throw new Error('Authenticated user required for review');

  const productId = String(payload.product_id || '').trim();
  if (!productId) throw new Error('product_id is required');

  const userName = String(payload.user_name || user.user_metadata?.full_name || user.email || '').trim();
  const userEmail = String(payload.user_email || user.email || '').trim().toLowerCase();
  const rating = Number(payload.rating) || 0;
  const comment = String(payload.comment || '').trim();
  const status = String(payload.status || 'pending').trim() || 'pending';
  const basePatch = {
    product_id: productId,
    user_id: user.id,
    user_email: userEmail,
    user_name: userName,
    rating,
    comment,
    status,
    updated_at: new Date().toISOString()
  };

  const { data: existing, error: existingError } = await supabaseClient
    .from('product_reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();
  console.log('SUPABASE RESPONSE:', existing);
  console.log('SUPABASE ERROR:', existingError);
  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await supabaseClient.from('product_reviews').update(basePatch).eq('id', existing.id).select('*');
    console.log('SUPABASE RESPONSE:', data);
    console.log('SUPABASE ERROR:', error);
    if (error) throw error;
    return (data || []).map(mapReview);
  }

  const insertPayload = {
    ...basePatch,
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('product_reviews').insert([insertPayload]).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function updateReviewDb(id, patch = {}) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('product_reviews').update(payload).eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function deleteReviewDb(id) {
  const { data, error } = await supabaseClient.from('product_reviews').delete().eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function recalculateProductRatingDb(productId) {
  const normalizedId = String(productId || '').trim();
  if (!normalizedId) return null;
  const { data: reviews, error: reviewsError } = await supabaseClient
    .from('product_reviews')
    .select('rating')
    .eq('product_id', normalizedId)
    .eq('status', 'approved');
  console.log('SUPABASE RESPONSE:', reviews);
  console.log('SUPABASE ERROR:', reviewsError);
  if (reviewsError) throw reviewsError;

  const rows = Array.isArray(reviews) ? reviews : [];
  const reviewsCount = rows.length;
  const rating = reviewsCount ? rows.reduce((sum, row) => sum + (Number(row.rating) || 0), 0) / reviewsCount : 0;

  const { data, error } = await supabaseClient
    .from('products')
    .update({ rating, reviews_count: reviewsCount })
    .eq('id', toDbId(normalizedId))
    .select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapProduct)?.[0] || null;
}

async function reserveProductQuantitiesDb(items = []) {
  const qtyById = buildQtyMap(items);
  const ids = Array.from(qtyById.keys());
  if (!ids.length) return [];

  const dbIds = ids.map(toDbId);
  const { data: rows, error } = await supabaseClient.from('products').select('id, quantity').in('id', dbIds);
  console.log('SUPABASE RESPONSE:', rows);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;

  const stockMap = new Map((rows || []).map((row) => [String(row.id), Number(row.quantity) || 0]));
  ids.forEach((id) => {
    if (!stockMap.has(id)) {
      throw new Error(`Product ${id} not found in Supabase`);
    }
    const requested = Number(qtyById.get(id)) || 0;
    const current = Number(stockMap.get(id)) || 0;
    if (requested > current) {
      throw new Error(`Insufficient stock for product ${id}. Available: ${current}, requested: ${requested}`);
    }
  });

  const applied = [];
  try {
    for (const id of ids) {
      const requested = Number(qtyById.get(id)) || 0;
      const current = Number(stockMap.get(id)) || 0;
      const next = Math.max(0, current - requested);
      const dbId = toDbId(id);
      const { data: updated, error: updateError } = await supabaseClient
        .from('products')
        .update({ quantity: next })
        .eq('id', dbId)
        .eq('quantity', current)
        .select('id, quantity');
      console.log('SUPABASE RESPONSE:', updated);
      console.log('SUPABASE ERROR:', updateError);
      if (updateError) throw updateError;
      if (!updated || !updated.length) {
        throw new Error(`Stock update conflict for product ${id}. Please retry checkout.`);
      }
      applied.push({
        id,
        dbId,
        previousQuantity: current,
        newQuantity: Number(updated[0]?.quantity) || next,
        reserved: requested
      });
    }
    return applied;
  } catch (reserveError) {
    for (const row of applied) {
      try {
        const { data: rollbackData, error: rollbackError } = await supabaseClient
          .from('products')
          .update({ quantity: row.previousQuantity })
          .eq('id', row.dbId)
          .select('id, quantity');
        console.log('SUPABASE RESPONSE:', rollbackData);
        console.log('SUPABASE ERROR:', rollbackError);
      } catch (rollbackCrash) {
        console.log('SUPABASE RESPONSE:', null);
        console.log('SUPABASE ERROR:', rollbackCrash);
      }
    }
    throw reserveError;
  }
}

async function restoreProductQuantitiesDb(reservations = []) {
  const rows = Array.isArray(reservations) ? reservations : [];
  const restored = [];
  for (const row of rows) {
    const previousQuantity = Number(row?.previousQuantity);
    if (!Number.isFinite(previousQuantity)) continue;
    const dbId = row?.dbId ?? toDbId(row?.id);
    const { data, error } = await supabaseClient
      .from('products')
      .update({ quantity: previousQuantity })
      .eq('id', dbId)
      .select('id, quantity');
    console.log('SUPABASE RESPONSE:', data);
    console.log('SUPABASE ERROR:', error);
    if (error) throw error;
    restored.push(...(data || []));
  }
  return restored;
}

async function upsertProductDb(prod) {
  const { data, error } = await supabaseClient.from('products').upsert(prod).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data;
}

async function deleteProductDb(id) {
  const { data, error } = await supabaseClient.from('products').delete().eq('id', id).select('*');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data;
}

async function signUpAuth(email, password, metadata = {}) {
  const safeEmail = String(email || '').trim().toLowerCase();
  const fallbackName = safeEmail.includes('@') ? safeEmail.split('@')[0] : '';
  const signupMeta = {
    role: 'user',
    full_name: metadata?.full_name || fallbackName
  };
  const { data, error } = await supabaseClient.auth.signUp({
    email: safeEmail,
    password,
    options: {
      data: signupMeta
    }
  });
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data;
}

async function signInAuth(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data;
}

async function signOutAuth() {
  const { error } = await supabaseClient.auth.signOut();
  console.log('SUPABASE RESPONSE:', null);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
}

async function getAuthUser() {
  return safeGetAuthUser();
}

async function getUserRoleDb() {
  const user = await safeGetAuthUser();
  if (!user) return null;

  const { data, error } = await supabaseClient.from('users').select('role').eq('id', user.id).maybeSingle();
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return data?.role || null;
}

async function fetchCartDb() {
  const user = await safeGetAuthUser();
  if (!user) return [];

  const { data, error } = await supabaseClient.from('user_carts').select('items').eq('user_id', user.id).maybeSingle();
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return Array.isArray(data?.items) ? data.items : [];
}

async function upsertCartDb(items = []) {
  const user = await safeGetAuthUser();
  if (!user) throw new Error('Authenticated user required for cart sync');

  const payload = {
    user_id: user.id,
    items: Array.isArray(items) ? items : [],
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('user_carts').upsert(payload).select('items');
  console.log('SUPABASE RESPONSE:', data);
  console.log('SUPABASE ERROR:', error);
  if (error) throw error;
  return Array.isArray(data?.[0]?.items) ? data[0].items : payload.items;
}

function onCartChangeDb(userId, callback) {
  const channel = supabaseClient
    .channel(`user-cart-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_carts',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback?.(payload);
      }
    )
    .subscribe();
  return channel;
}

async function offCartChangeDb(channel) {
  if (!channel) return;
  await supabaseClient.removeChannel(channel);
}

function onAuthChange(callback) {
  return supabaseClient.auth.onAuthStateChange((event, session) => {
    callback?.(event, session);
  });
}

window.db = {
  supabaseClient,
  fetchProductsDb,
  fetchProductsByIdsDb,
  upsertProductDb,
  deleteProductDb,
  fetchOrdersDb,
  insertOrderDb,
  updateOrderStatusDb,
  updateOrderPaymentDb,
  fetchSupportMessagesDb,
  insertSupportMessageDb,
  updateSupportMessageDb,
  fetchFavoritesDb,
  addFavoriteDb,
  removeFavoriteDb,
  fetchReviewsDb,
  upsertReviewDb,
  updateReviewDb,
  deleteReviewDb,
  recalculateProductRatingDb,
  createPaymentIntentDb,
  confirmPaymentDb,
  secureCheckoutDb,
  reserveProductQuantitiesDb,
  restoreProductQuantitiesDb,
  signUpAuth,
  signInAuth,
  signOutAuth,
  getAuthUser,
  getUserRoleDb,
  fetchCartDb,
  upsertCartDb,
  onCartChangeDb,
  offCartChangeDb,
  onAuthChange
};

