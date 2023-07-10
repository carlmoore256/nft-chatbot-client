import APIClient from './api.js';
import { ChatSession, ChatUI } from './chat.js';
import { DEFAULT_ENV } from './defaults.js';
import { WalletConnection, WalletUI } from './wallet.js';
if (!window.env) window.env = DEFAULT_ENV;

async function sendMessage(message) {
    if (window.chatSession === null) {
        window.chatSession = await ChatSession.create(new APIClient(window.env.API_URL));
    }
    if (message.trim() == "") {
        return false;
    }
    await window.chatSession.sendMessage(message);
    return false;
}

$(document).ready(function() {
    
    ChatUI.enableSubmitButton(false);

    $('#page-title').html(window.env.PAGE_TITLE);
    
    WalletUI.toggleWalletStatus(WalletConnection.isConnected); // do this right away
    if (WalletConnection.isConnected) {
        ChatSession.createOrLoad(new APIClient(window.env.API_URL))
        .then(session => window.chatSession = session)
        .catch(error => console.log("Error: " + error));
    }

    $('.chat-form').submit((event) => {
        event.preventDefault();
        try {
            sendMessage($("#user-input").val());
            $('#user-input').val(''); // Clear the text input after submitting
        } catch (error) {
            console.error(error);
        }
    });

    // will only be visible if WalletConnection is not connected
    $("#btn-connect").click(async() => {
        await WalletConnection.connect();
        WalletUI.toggleWalletStatus(WalletConnection.isConnected);
        const api = new APIClient(window.env.API_URL);
        await api.authenticate();
        window.chatSession = await ChatSession.createOrLoad(api);
    });

    $("#btn-reset").click(() => {
        console.log("Reset button clicked");
        localStorage.removeItem('sessionId');
        // localStorage.removeItem('jwtToken');
        // localStorage.removeItem('walletAddress');
        window.chatSession.reset(() => window.chatSession = null);
    })

});