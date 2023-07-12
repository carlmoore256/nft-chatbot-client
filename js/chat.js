import { Message } from './message.js';
import APIClient from './api.js';

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

    static async init() {
        if (!window.chatSession) {
            this.current = await ChatSession.create(APIClient.Instance);
        }
    }

    get current() {
        if (window.chatSession === null) {
            throw new Error("Chat session not initialized");
        }
        return window.chatSession;
    }

    set current(session) {
        window.chatSession = session;
    }
    
    static async sendMessage(message) {
        if (message.trim() == "") {
            return false;
        }
        await window.chatSession.sendMessage(message);
        return false;
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
            this.messages.push(new Message(message.message, message.role, message.id));
        }
        this.render();
    }
    
    static async create(apiClient) {
        const sessionId = await apiClient.getSessionId();
        return new ChatSession(sessionId, apiClient); 
    }

    static async load(apiClient, sessionId) {
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
                message.remove();
                console.log(`Removing message: ${message.message} | ${message.role}`);
                const index = this.messages.indexOf(message);
                if (index !== -1) {
                    this.messages.splice(index, 1);
                    this.render();
                } else {
                    this.render();
                    onComplete();
                }
            }, i * 10); // delay each removal by 100ms more than the last
        }
    }
}


export class ChatUI {
    
    static async init() {
        $('.chat-form').submit((event) => {
            event.preventDefault();
            try {
                ChatSession.sendMessage($("#user-input").val());
                $('#user-input').val(''); // Clear the text input after submitting
            } catch (error) {
                console.error(error);
            }
        });
        
        $("#btn-reset").click(() => {
            console.log("Reset button clicked");
            localStorage.removeItem('sessionId');
            // localStorage.removeItem('jwtToken');
            // localStorage.removeItem('walletAddress');
            window.chatSession.reset(() => window.chatSession = null);
        });
        
        $("#btn-open").click(async() => {
            await ChatSelectionUI.toggleOverlay();
        });
    }
    
    static enableSubmitButton(isEnabled) {
        $("#chat-submit").prop("disabled", !isEnabled);
    }
}

export class ChatSelectionUI {

    static isShowing = false;

    static async toggleOverlay() {
        if (this.isShowing) {
            $("#chat-selection-overlay").hide(0);
            // $("#chat-selection-overlay").removeClass("show");
        } else {
            // $("#chat-selection-overlay").addClass("show");
            $("#chat-selection-overlay").show(0, () => {
                $("#chat-selection-overlay").css("display", "flex")
                console.log("SHOWING COMPLETE")
            });
            await this.fillChatSelection();
        }
        this.isShowing = !this.isShowing;
        console.log("Toggling overlay " + this.isShowing);
    }


    static async fillChatSelection() {
        const apiClient = APIClient.Instance;
        const sessions = await apiClient.listSessions();
        console.log(sessions);
        // let html = "";
        $("#selection-container").empty();
        for (const session of sessions) {
            // html += `<div class="chat-selection-item" data-session-id="${session.id}">${session.title || 'untitled'}</div>`;
            $("#selection-container").append(`<div class="chat-selection-item" data-session-id="${session.id}">
                <h4>${session.title || 'untitled'}</h4>
                <p>${session.numMessages} messages</p>
            </div>`)
        }
        // $("#chat-selection").html(html);
        $(".chat-selection-item").click((event) => {
            const sessionId = $(event.target).data("session-id");
            console.log("Selected session: " + sessionId);
            ChatSession.load(apiClient, sessionId)
                .then((session) => {
                    window.chatSession = session;
                    ChatSelectionUI.toggleOverlay();
                }
            );
        });
    }

}