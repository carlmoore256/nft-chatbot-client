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

});