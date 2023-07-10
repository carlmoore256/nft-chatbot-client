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

    static async createOrLoad(apiClient) {
        const existingSessionId = localStorage.getItem('sessionId');
        if (existingSessionId) {
            return await ChatSession.load(apiClient, localStorage.getItem('sessionId'));
        } else {
            return await ChatSession.create(apiClient);
        }
    }
    
    static async create(apiClient) {
        const sessionId = await apiClient.getSessionId();
        console.log("Created new session ID: " + sessionId);
        return new ChatSession(sessionId, apiClient); 
    }

    static async load(apiClient, sessionId) {
        await apiClient.loadSession(sessionId);
        return new ChatSession(sessionId, apiClient);
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

export class ChatUI {
    
    async sendMessage(message) {
        if (window.chatSession === null) {
            window.chatSession = await ChatSession.create(new APIClient(window.env.API_URL));
        }
        if (message.trim() == "") {
            return false;
        }
        await window.chatSession.sendMessage(message);
        return false;
    }

    static enableSubmitButton(isEnabled) {
        $("#chat-submit").prop("disabled", !isEnabled);
    }

}
