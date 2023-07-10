
export class Message {
    
    constructor(message, sender) {
        this.message = message;
        this.sender = sender;
    }

    addToMessage(text) {
        this.message += text;
    }

    render() {
        var senderClass = "chat-message-sent";
        if (this.sender == "ai") {
            senderClass = "chat-message-received";
        }
        var formattedMessage = this.message.replace(/\\n/g, '\n').replace(/\n/g, '<br>'); 
        return `<div class="chat-bubble ` + senderClass + '">' + formattedMessage + '</div>';
    }
}

export class MessageHistory {
    
    constructor() {
        this.messages = [];
    }

    addMessage(message) {
        this.messages.push(message);
        this.render();
    }

    getMessages(limit=null) {
        if (limit !== null) {
            return this.messages.slice(this.messages.length - limit, -1);
        }
        return this.messages;
    }

    render() {
        var html = "";
        for (let i = 0; i < this.messages.length; i++) {
            html += this.messages[i].render();
        }
        $("#chat-body").html(html);
    }
}
