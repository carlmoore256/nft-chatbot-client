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
        APIClient.reset();
        ChatSession.create(new APIClient(window.env.API_URL))
            .then((session) => {
                window.chatSession = session;
                session.sendMessage("Hello");
            }).catch((error) => {
                console.log("Error: " + error);
            });
    });

});