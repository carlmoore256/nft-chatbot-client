import { Message } from './message.js';

export class ChatSession {

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
    // static async create(apiClient) {
    //     await apiClient.authenticate(); // will try to authenticate, if it hasn't already
    //     const sessionId = await apiClient.getSessionId(); // gets a session id from the api
    //     console.log("Session ID: " + sessionId + " API Token: " + apiClient.token);
    //     return new ChatSession(sessionId, apiClient); 
    // }
    static async create(apiClient) {
        await apiClient.authenticate();
        const existingSessionId = localStorage.getItem('sessionId');
        if (existingSessionId) {
            // Load existing session from server
            await apiClient.loadSession(existingSessionId);
            console.log("Loaded existing session ID: " + existingSessionId);
            return new ChatSession(existingSessionId, apiClient);
        } else {
            // Create new session
            const sessionId = await apiClient.getSessionId();
            console.log("Created new session ID: " + sessionId);
            return new ChatSession(sessionId, apiClient); 
        }
    }


    sendMessage(message) {
        this.messages.push(new Message(message, "human"));
        const replyMessage = new Message("", "ai");
        this.messages.push(replyMessage);

        this.api.sendMessage(this.sessionId, message, (text) => {
            replyMessage.addToMessage(text);
            this.render();
        });
    }

    render(element = "#chat-body") {
        var html = "";
        for (let i = 0; i < this.messages.length; i++) {
            html += this.messages[i].render();
        }
        $(element).html(html);
    }
}
