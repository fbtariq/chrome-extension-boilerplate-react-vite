import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { createClient } from "@supabase/supabase-js";

refreshOnUpdate('pages/popup');

const supabaseUrl = "https://kurzppsqguyfqsceuuaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnpwcHNxZ3V5ZnFzY2V1dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MjkxNTQsImV4cCI6MjAyMzAwNTE1NH0.tWvW1bBMOZVpWFV7mfxxdHg0BeF9NZeqL_cmyg9CWMQ";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// get auth url
export async function signInWithGoogle() {
  console.log(chrome.identity.getRedirectURL());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: chrome.identity.getRedirectURL(),
    },
  });

  if (error) throw error;

  console.log(data);
  // sleep for 4 seconds
  //await new Promise((resolve) => setTimeout(resolve, 4000));
  await chrome.tabs.create({ url: data.url });
}



function init() {
  console.log('popup loaded')

  checkSession();

  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(<Popup />);
}

init();


async function checkSession() {
  const { session } = await chrome.storage.local.get('session');
  if (session) {
    const { error: supaAuthError } = await supabase.auth.setSession(
      session
    );
    if (supaAuthError) {
      throw supaAuthError;
    }

    console.log('session found');

    // redirect to another page
    chrome.runtime.sendMessage({ type: 'session', session });
    chrome.runtime.sendMessage({ type: 'navigate', path: '/home' });


    navigate('/home');
  } else {
    console.log('no session found');
  }
}