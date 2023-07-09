
class ChatSession {

    messages = [];

    constructor(sessionId, api) {
        this.sessionId = sessionId;
        this.api = api;
        this.setLocalSessionId(sessionId);
    }
    
    setLocalSessionId(sessionId) {
        console.log("Setting Session ID to: " + sessionId);
        localStorage.setItem('sessionId', sessionId);
    }

    // can create a new session whether or not it already exists on the server
    static async create() {
        const api = new APIClient();
        await api.authenticate(); // will try to authenticate, if it hasn't already
        const sessionId = await api.getSessionId(); // gets a session id from the api
        console.log("Session ID: " + sessionId + " API Token: " + api.token);
        return new ChatSession(sessionId, api); 
    }

    sendMessage(message) {
        this.messages.push(new Message(message, "human"));
        const eventSource = this.api.sendMessage(this.sessionId, message);
        
        const replyMessage = new Message("", "ai");
        this.messages.push(replyMessage);

        eventSource.onmessage = (event) => {
            if (event.data !== 'null') {
                replyMessage.addToMessage(event.data.replaceAll('"', ""));
                this.render();
            }
        };

        eventSource.addEventListener('close', function(event) {
            console.log('Received close event');
            intentionalClose = true;
            eventSource.close();
        }, false);

        eventSource.onerror = (error) => {
            console.log('EventSource failed: ', error);
            eventSource.close();
        };
    }

    render(element = "#chat-body") {
        var html = "";
        for (let i = 0; i < this.messages.length; i++) {
            html += this.messages[i].render();
        }
        $(element).html(html);
    }
}
