import { generateId } from "./utils";

export class Message {
    
    constructor(message, role , id = null) {
        this.message = message;
        this.role = role;
        this.id = id || generateId(16);        
    }

    addToMessage(text) {
        this.message += text;
    }

    render() {
        var senderClass = "chat-message-sent";
        if (this.role == "ai") {
            senderClass = "chat-message-received";
        }
        var formattedMessage = this.message.replace(/\\n/g, '\n').replace(/\n/g, '<br>'); 
        return `<div id=${this.id} class="chat-bubble ` + senderClass + '">' + formattedMessage + '</div>';
    }

    remove() {
        const messageElement = $(`#${this.id}`);
        messageElement.css('animation', 'fade-out 1s forwards');
        messageElement.on('animationend', () => {
            console.log(`Animation ended!: $s{this.message} | ${this.role}`)
            messageElement.remove();
        });
    }
}