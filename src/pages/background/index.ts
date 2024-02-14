import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import { createClient } from "@supabase/supabase-js";

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

const supabaseUrl = "https://kurzppsqguyfqsceuuaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cnpwcHNxZ3V5ZnFzY2V1dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MjkxNTQsImV4cCI6MjAyMzAwNTE1NH0.tWvW1bBMOZVpWFV7mfxxdHg0BeF9NZeqL_cmyg9CWMQ";

// add tab listener when background script starts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url?.startsWith(chrome.identity.getRedirectURL())) {
        finishUserOAuth(changeInfo.url);
    }
});

/**
 * Method used to finish OAuth callback for a user authentication.
 */
async function finishUserOAuth(url: string) {
    try {
        console.log(`handling user OAuth callback ...`);
        const supabase = createClient(supabaseUrl, supabaseKey);

        // extract tokens from hash
        const hashMap = parseUrlHash(url);
        const access_token = hashMap.get('access_token');
        const refresh_token = hashMap.get('refresh_token');
        if (!access_token || !refresh_token) {
            throw new Error(`no supabase tokens found in URL hash`);
        }

        // check if they work
        const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
        });
        if (error) throw error;
        console.log("data");
        console.log(data);

        // persist session to storage
        await chrome.storage.local.set({ session: data.session });

        // sleep for 4 seconds
        await new Promise((resolve) => setTimeout(resolve, 4000));
        // finally redirect to a post oauth page
        chrome.tabs.update({ url: "https://myapp.com/user-login-success/" });

        console.log(`finished handling user OAuth callback`);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Helper method used to parse the hash of a redirect URL.
 */
function parseUrlHash(url: string) {
    const hashParts = new URL(url).hash.slice(1).split('&');
    const hashMap = new Map(
        hashParts.map((part) => {
            const [name, value] = part.split('=');
            return [name, value];
        })
    );

    return hashMap;
}

// add listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('onInstalled ...');
    // open the options page
    chrome.runtime.openOptionsPage();
});

// add listener for when the extension is updated
chrome.runtime.onUpdateAvailable.addListener(() => {
    console.log('onUpdateAvailable ...');
    // reload the extension
    chrome.runtime.reload();
});

// add listener for when the navigate message is received
chrome.runtime.onMessage.addListener((message, sender) => {
    console.log('onMessage ...');
    if (message.type === 'navigate') {
        console.log(`navigating to ${message.path} ...`);
        chrome.tabs.update(sender.tab.id, { url: message.path });
    }
});

// add listener for when the session message is received
chrome.runtime.onMessage.addListener((message) => {
    console.log('onMessage ...');
    if (message.type === 'session') {
        console.log(`received session ...`);
        console.log(message.session);
    }
});

