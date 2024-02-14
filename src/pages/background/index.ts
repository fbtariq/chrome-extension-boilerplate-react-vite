import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case "signInWithGoogle": {

            // remove any old listener if exists
            chrome.tabs.onUpdated.removeListener(setTokens)
            const url = request.payload.url;
            alert(`url: ${url}`);

            // create new tab with that url
            chrome.tabs.create({ url: url, active: true }, (tab) => {
                // add listener to that url and watch for access_token and refresh_token query string params
                chrome.tabs.onUpdated.addListener(setTokens)
                sendResponse(request.action + " executed")
            })

            break
        }

        default:
            break
    }

    return true
})

const setTokens = async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
) => {

    // once the tab is loaded
    if (tab.status === "complete") {
        if (!tab.url) return
        const url = new URL(tab.url)

        alert("url");
        alert(url);

        // at this point user is logged-in to the web app
        // url should look like this: https://my.webapp.com/#access_token=zI1NiIsInR5c&expires_in=3600&provider_token=ya29.a0AVelGEwL6L&refresh_token=GEBzW2vz0q0s2pww&token_type=bearer
        // parse access_token and refresh_token from query string params
        if (url.origin /*=== "https://my.webapp.com"*/) {
            alert(url.origin)
            const params = new URL(url.href).searchParams;
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");

            if (accessToken && refreshToken) {
                if (!tab.id) return

                // we can close that tab now
                await chrome.tabs.remove(tab.id)

                // store access_token and refresh_token in storage as these will be used to authenticate user in chrome extension
                await chrome.storage.sync.set({
                    "gauthAccessToken": accessToken
                })
                await chrome.storage.sync.set({
                    "gauthRefreshToken": refreshToken
                })

                // remove tab listener as tokens are set
                chrome.tabs.onUpdated.removeListener(setTokens)
            }
        }
    }
}