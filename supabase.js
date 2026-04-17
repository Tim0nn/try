// Supabase client setup (UMD build already loaded)
const supabaseUrl = 'https://zyaadswbpfnnbnzucinl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWFkc3dicGZubmJuenVjaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDgzNzIsImV4cCI6MjA4OTE4NDM3Mn0.vqop1nUIUDUWzlerYkfE3t6qnBs9TeQLL3VXsTQXWLQ';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

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
    tags,
    quantity,
    category: p.category || 'General',
    created_at: p.created_at || ''
  };
};

async function fetchProductsDb() {
  const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: true });
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
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
  const { data, error } = await supabaseClient.from('products').select('*').in('id', normalizedIds);
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapProduct);
}

const mapOrder = (order) => ({
  id: order.id,
  user_email: order.user_email || '',
  user_name: order.user_name || '',
  items: Array.isArray(order.items) ? order.items : [],
  total: Number(order.total) || 0,
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
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapOrder);
}

async function insertOrderDb(order) {
  let payload = { ...order };
  let result = await supabaseClient.from('orders').insert([payload]).select('*');
  console.log('DATA:', result.data);
  console.log('ERROR:', result.error);
  if (result.error && /payment_status/i.test(String(result.error.message || ''))) {
    const { payment_status, ...fallbackPayload } = payload;
    result = await supabaseClient.from('orders').insert([fallbackPayload]).select('*');
    console.log('DATA:', result.data);
    console.log('ERROR:', result.error);
  }
  if (result.error) throw result.error;
  return (result.data || []).map(mapOrder);
}

async function updateOrderStatusDb(id, status) {
  const { data, error } = await supabaseClient.from('orders').update({ status }).eq('id', id).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
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
  console.log('DATA:', result.data);
  console.log('ERROR:', result.error);
  if (result.error && /payment_status/i.test(String(result.error.message || ''))) {
    const { payment_status, ...fallbackPatch } = cleanPatch;
    result = await supabaseClient.from('orders').update(fallbackPatch).eq('id', id).select('*');
    console.log('DATA:', result.data);
    console.log('ERROR:', result.error);
  }
  if (result.error) throw result.error;
  return (result.data || []).map(mapOrder);
}

async function invokePaymentFunction(name, payload = {}) {
  const { data, error } = await supabaseClient.functions.invoke(name, { body: payload });
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data || null;
}

async function createPaymentIntentDb(payload = {}) {
  return invokePaymentFunction('create-payment-intent', payload);
}

async function confirmPaymentDb(payload = {}) {
  return invokePaymentFunction('confirm-payment', payload);
}

async function fetchSupportMessagesDb() {
  const { data, error } = await supabaseClient.from('support_messages').select('*').order('created_at', { ascending: false });
  console.log('DATA:', data);
  console.log('ERROR:', error);
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
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapSupportMessage);
}

async function updateSupportMessageDb(id, patch) {
  const { data, error } = await supabaseClient.from('support_messages').update(patch).eq('id', id).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapSupportMessage);
}

async function fetchFavoritesDb() {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
  if (!user) return [];

  const { data, error } = await supabaseClient
    .from('user_favorites')
    .select('product_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map((row) => String(row.product_id)).filter(Boolean);
}

async function addFavoriteDb(productId) {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
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
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map((row) => String(row.product_id)).filter(Boolean);
}

async function removeFavoriteDb(productId) {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
  if (!user) throw new Error('Authenticated user required for favorites');

  const { data, error } = await supabaseClient
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', String(productId || '').trim())
    .select('product_id');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return true;
}

async function fetchReviewsDb(filters = {}) {
  let query = supabaseClient.from('product_reviews').select('*').order('created_at', { ascending: false });
  if (filters.product_id) query = query.eq('product_id', String(filters.product_id));
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  const { data, error } = await query;
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function upsertReviewDb(payload = {}) {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
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
  console.log('DATA:', existing);
  console.log('ERROR:', existingError);
  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await supabaseClient.from('product_reviews').update(basePatch).eq('id', existing.id).select('*');
    console.log('DATA:', data);
    console.log('ERROR:', error);
    if (error) throw error;
    return (data || []).map(mapReview);
  }

  const insertPayload = {
    ...basePatch,
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('product_reviews').insert([insertPayload]).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function updateReviewDb(id, patch = {}) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('product_reviews').update(payload).eq('id', id).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapReview);
}

async function deleteReviewDb(id) {
  const { data, error } = await supabaseClient.from('product_reviews').delete().eq('id', id).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
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
  console.log('DATA:', reviews);
  console.log('ERROR:', reviewsError);
  if (reviewsError) throw reviewsError;

  const rows = Array.isArray(reviews) ? reviews : [];
  const reviewsCount = rows.length;
  const rating = reviewsCount ? rows.reduce((sum, row) => sum + (Number(row.rating) || 0), 0) / reviewsCount : 0;

  const { data, error } = await supabaseClient
    .from('products')
    .update({ rating, reviews_count: reviewsCount })
    .eq('id', toDbId(normalizedId))
    .select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return (data || []).map(mapProduct)?.[0] || null;
}

async function reserveProductQuantitiesDb(items = []) {
  const qtyById = buildQtyMap(items);
  const ids = Array.from(qtyById.keys());
  if (!ids.length) return [];

  const dbIds = ids.map(toDbId);
  const { data: rows, error } = await supabaseClient.from('products').select('id, quantity').in('id', dbIds);
  console.log('DATA:', rows);
  console.log('ERROR:', error);
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
      console.log('DATA:', updated);
      console.log('ERROR:', updateError);
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
        console.log('DATA:', rollbackData);
        console.log('ERROR:', rollbackError);
      } catch (rollbackCrash) {
        console.log('DATA:', null);
        console.log('ERROR:', rollbackCrash);
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
    console.log('DATA:', data);
    console.log('ERROR:', error);
    if (error) throw error;
    restored.push(...(data || []));
  }
  return restored;
}

async function upsertProductDb(prod) {
  const { data, error } = await supabaseClient.from('products').upsert(prod).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data;
}

async function deleteProductDb(id) {
  const { data, error } = await supabaseClient.from('products').delete().eq('id', id).select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
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
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data;
}

async function signInAuth(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data;
}

async function signOutAuth() {
  const { error } = await supabaseClient.auth.signOut();
  console.log('DATA:', null);
  console.log('ERROR:', error);
  if (error) throw error;
}

async function getAuthUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data?.user || null;
}

async function getUserRoleDb() {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
  if (!user) return null;

  const { data, error } = await supabaseClient.from('users').select('role').eq('id', user.id).maybeSingle();
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return data?.role || null;
}

async function fetchCartDb() {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
  if (!user) return [];

  const { data, error } = await supabaseClient.from('user_carts').select('items').eq('user_id', user.id).maybeSingle();
  console.log('DATA:', data);
  console.log('ERROR:', error);
  if (error) throw error;
  return Array.isArray(data?.items) ? data.items : [];
}

async function upsertCartDb(items = []) {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  console.log('DATA:', authData);
  console.log('ERROR:', authError);
  if (authError) throw authError;
  const user = authData?.user || null;
  if (!user) throw new Error('Authenticated user required for cart sync');

  const payload = {
    user_id: user.id,
    items: Array.isArray(items) ? items : [],
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabaseClient.from('user_carts').upsert(payload).select('items');
  console.log('DATA:', data);
  console.log('ERROR:', error);
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
