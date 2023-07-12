import APIClient from './api.js';
import { ChatSession, ChatUI } from './chat.js';
import { DEFAULT_ENV } from './defaults.js';
import { WalletConnection, WalletUI } from './wallet.js';
if (!window.env) window.env = DEFAULT_ENV;


$(document).ready(function() {
    
    ChatUI.enableSubmitButton(false);

    $('#page-title').html(window.env.PAGE_TITLE);
    
    WalletUI.toggleWalletStatus(WalletConnection.isConnected); // do this right away
    if (WalletConnection.isConnected) {
        ChatSession.createOrLoad(APIClient.Instance)
        .then(session => window.chatSession = session)
        .catch(error => console.log("Error: " + error));
    }

    ChatSession.init();
    ChatUI.init();

    // will only be visible if WalletConnection is not connected
    $("#btn-connect").click(async() => {
        await WalletConnection.connect();
        WalletUI.toggleWalletStatus(WalletConnection.isConnected);
        await APIClient.Instance.authenticate();
        window.chatSession = await ChatSession.createOrLoad(APIClient.Instance);
    });
});