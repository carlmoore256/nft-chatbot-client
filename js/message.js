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

    formatCode(message) {
        // Check if the message is a code block
        const codeBlockPattern = /```([^`]+)```/g;
        const codeBlockMatch = codeBlockPattern.exec(message);
        if (codeBlockMatch) {
            // The code block, including backticks and potential language specification
            const fullMatch = codeBlockMatch[0];
            // The content of the code block, without backticks
            const content = codeBlockMatch[1].trim();
            // Split the content into lines
            const lines = content.split('<br>');
            // The potential language is specified on the first line
            const potentialLang = lines[0];
            // Check if the first line is a known language
            if (['javascript', 'python'].includes(potentialLang)) {
                // Remove the first line (the language) from the lines array
                lines.shift();
                // Join the remaining lines back together
                const codeWithoutLang = lines.join('<br>');
                // Replace the matched string with formatted code, adding the language as a class
                message = message.replace(
                    fullMatch,
                    `<div class="code-block language-${potentialLang}"><pre><code>${codeWithoutLang}</code></pre></div>`
                );
            } else {
                // If no known language was found, revert to the previous behavior
                message = message.replace(
                    fullMatch,
                    `<div class="code-block"><pre><code>${content}</code></pre></div>`
                );
            }
        }
        return message;
    }

    render() {
        let senderClass = "chat-message-sent";
        if (this.role == "ai") {
            senderClass = "chat-message-received";
        }
        let formattedMessage = this.message.replace(/\\n/g, '\n').replace(/\n/g, '<br>'); 
        // try to format code if it is a code block
        formattedMessage = this.formatCode(formattedMessage);
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