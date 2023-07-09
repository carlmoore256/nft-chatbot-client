async function sendMessage(message) {
    if (window.chatSession === null) {
        window.chatSession = await ChatSession.create();
    }    
    if (message.trim() == "") {
        return false;
    }
    await window.chatSession.sendMessage(message);
    return false;
}

$(document).ready(function() { 
    
    $('.chat-form').submit(function(event) {
        event.preventDefault();
        try {
            sendMessage($("#user-input").val());
            $('#user-input').val(''); // Clear the text input after submitting
        } catch (error) {
            console.error(error);
        }
    });

    $("#connect-btn").click(function() {
        console.log("Connect button clicked");
        if (window.chatSession === null) {
            ChatSession.create().then((session) => {
                window.chatSession = session;
                console.log("Created chat session");
            }).catch((error) => {
                console.log("Error: " + error);
            });
        }
    });

});