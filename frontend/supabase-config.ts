import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

// Wrap fetch with a 20-second timeout so that a hanging token refresh or network
// hiccup causes a rejection (→ React Query retries) instead of a Promise that
// never settles (→ infinite loading state).
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20_000);

  // Preserve any caller-supplied signal alongside our timeout signal.
  init?.signal?.addEventListener('abort', () => controller.abort());

  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Used for token refresh requests inside GoTrueClient.
    fetch: fetchWithTimeout,
  },
  global: {
    // Used for all PostgREST / Storage / Edge Function requests.
    fetch: fetchWithTimeout,
  },
});

export default supabase;