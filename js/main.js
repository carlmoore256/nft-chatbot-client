import APIClient from './api.js';
import { ChatSession } from './chat.js';
import { DEFAULT_ENV } from './defaults.js';
import { WalletConnection } from './wallet.js';
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
    
    $('#page-title').html(window.env.PAGE_TITLE);

    WalletConnection.addListener((address, isConnected) => {
        const walletStatus = $("#wallet-status");
        const statusIndicator = walletStatus.find(".status-indicator");
        const statusText = walletStatus.find(".status-text");
        if (isConnected) {
            statusIndicator.removeClass("disconnected");
            statusIndicator.addClass("connected");
            statusText.html("Connected");
        } else {
            statusIndicator.removeClass("connected");
            statusIndicator.addClass("disconnected");
            statusText.html("Disconnected");
        }
    })

    $('.chat-form').submit(function(event) {
        event.preventDefault();
        try {
            sendMessage($("#user-input").val());
            $('#user-input').val(''); // Clear the text input after submitting
        } catch (error) {
            console.error(error);
        }
    });

    if (localStorage.getItem('jwtToken')) {
        $("#btn-connect").hide();
    } else {
        $("#btn-connect").click(function() {
            console.log("Connect button clicked");
            APIClient.reset();
            ChatSession.create(new APIClient(window.env.API_URL))
                .then((session) => {
                    window.chatSession = session;
                    // hide the btn-connect
                    $("#btn-connect").hide();
                }).catch((error) => {
                    console.log("Error: " + error);
                });
        });
    }
});