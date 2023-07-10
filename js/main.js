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

// function toggleWalletStatus(isConnected) {
//     console.log("Is wallet connected?: " + isConnected);
//     const walletStatus = $("#wallet-status");
//     const statusIndicator = walletStatus.find(".status-indicator");
//     const statusText = walletStatus.find(".status-text");
//     if (isConnected) {
//         statusIndicator.removeClass("disconnected");
//         statusIndicator.addClass("connected");
//         statusText.html("Connected");
//         $("#btn-connect").hide();
//     } else {
//         statusIndicator.removeClass("connected");
//         statusIndicator.addClass("disconnected");
//         statusText.html("Disconnected");
//         $("#btn-connect").show();
//     }
// }



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
        const api = new APIClient(window.env.API_URL);
        await api.authenticate();
        window.chatSession = await ChatSession.createOrLoad(api);
        WalletUI.toggleWalletStatus(WalletConnection.isConnected);
    });

    $("#btn-reset").click(() => {
        console.log("Reset button clicked");
        localStorage.removeItem('sessionId');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('walletAddress');
        window.chatSession = null;
    })

});

// WalletConnection.addListener((address, isConnected) => {
//     toggleWalletStatus(isConnected);
//     if (isConnected) {
//         initializeChatSession();
//     }
// });
// if (localStorage.getItem('jwtToken')) {
//     $("#btn-connect").hide();
// } else {
//     $("#btn-connect").click(function() {
//         console.log("Connect button clicked");
//         // APIClient.reset();
//         ChatSession.create(new APIClient(window.env.API_URL))
//             .then((session) => {
//                 window.chatSession = session;
//                 // hide the btn-connect
//                 $("#btn-connect").hide();
//             }).catch((error) => {
//                 console.log("Error: " + error);
//             });
//     });
// }