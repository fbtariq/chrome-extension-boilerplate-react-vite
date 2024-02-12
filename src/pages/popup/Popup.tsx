import { createClient, User } from "@supabase/supabase-js";
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// get auth url
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google"
  });

  // tell background service worker to create a new tab with that url
  await chrome.runtime.sendMessage({
    action: "signInWithGoogle",
    payload: { url: data.url } // url is something like: https://[project_id].supabase.co/auth/v1/authorize?provider=google
  });
}