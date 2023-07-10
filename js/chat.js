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

    async loadMessages() {
        let messages = await this.api.loadSession(this.sessionId);

        messages = messages.sort((a, b) => { // sort by createdAt
            return new Date(a.createdAt) - new Date(b.createdAt);
        });     

        for (const message of messages) {
            console.log(`Adding message: ${message.message} | ${message.role} | ${message.id}`)
            this.messages.push(new Message(message.message, message.role, message.id));
        }
        this.render();
    }
    
    static async create(apiClient) {
        const sessionId = await apiClient.getSessionId();
        console.log("Created new session ID: " + sessionId);
        return new ChatSession(sessionId, apiClient); 
    }

    static async load(apiClient, sessionId) {
        console.log("REQUSTING TO LOAD SESSION: " + sessionId)
        await apiClient.loadSession(sessionId);
        const session = new ChatSession(sessionId, apiClient);
        await session.loadMessages();
        return session;
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

    reset(onComplete) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            console.log(`Setting animation for message: ${message.message} | ${message.role}`);
            setTimeout(() => {
                console.log(`Removing message: ${message.message} | ${message.role}`);
                message.remove();
                const index = this.messages.indexOf(message);
                if (index !== -1) {
                    this.messages.splice(index, 1);
                    this.render();
                } else {
                    this.render();
                    onComplete();
                }
            }, i * 100); // delay each removal by 100ms more than the last
        }
    }
    
    // reset() {
    //     for (let i = this.messages.length - 1; i >= 0; i--) {
    //         setTimeout(() => {
    //             this.messages[i].remove();
    //             this.messages.splice(i, 1);
    //         }, i * 100); // delay each removal by 100ms more than the last
    //     }
    // }
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
