import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = "https://kurzppsqguyfqsceuuaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnpwcHNxZ3V5ZnFzY2V1dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MjkxNTQsImV4cCI6MjAyMzAwNTE1NH0.tWvW1bBMOZVpWFV7mfxxdHg0BeF9NZeqL_cmyg9CWMQ";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
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


export async function getCurrentUser(): Promise<null | {
  user: User;
  accessToken: string;
}> {
  const gauthAccessToken = await chrome.storage.sync.get("gauthAccessToken");
  const gauthRefreshToken = await chrome.storage.sync.get("gauthRefreshToken");

  if (gauthAccessToken && gauthRefreshToken) {
    try {
      // set user session from access_token and refresh_token
      const resp = await supabase.auth.setSession({
        access_token: gauthAccessToken,
        refresh_token: gauthRefreshToken,
      });

      const user = resp.data?.user;
      const supabaseAccessToken = resp.data.session?.access_token;

      if (user && supabaseAccessToken) {
        return { user, accessToken: supabaseAccessToken };
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  return null;
}


refreshOnUpdate('pages/popup');

function init() {
  console.log('popup loaded')
  // get logged-in user info when invoking popup or initialising content script on the page 
  getCurrentUser().then((resp) => {
    if (resp) {
      console.log("user id:", resp.user.id);
    } else {
      console.log("user is not found");
    }
  });

  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(<Popup />);
}

init();
