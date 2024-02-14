import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('content view loaded');
  }, []);

  getSupabaseSession();

  return <div className="">content view</div>;
}

async function getSupabaseSession() {
  const { data: session, error } = await chrome.storage.local.get('supasession');
  if (error) throw error;

  if (session) {
    console.log('session found');
    console.log(session);
  } else {
    console.log('no session found');
  }
}
