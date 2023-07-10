import { WalletConnection } from "./wallet";

class APIClient {

    constructor(apiURL) {
        this.apiURL = apiURL;
    }

    static reset() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('sessionId');
    }

    /**
     * Send a request to the server for a message to sign
     */
    async getNonceMessage(walletAddress) {
        const response = await fetch(this.apiURL + "auth/nonce/" + walletAddress, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error("Failed to get message to sign");
        }
        const data = await response.json();
        const message = data.message;
        return message;
    }

    /**
     * Authenticates the wallet with the server, and if successful, returns a JWT token
     * @returns JWT Token
     */
    async authenticate() {       
        let existingToken = localStorage.getItem('jwtToken');
        if (existingToken) return existingToken;
        await WalletConnection.connect();
        const address = WalletConnection.address;
        const message = await this.getNonceMessage(address);
        const signature = await WalletConnection.signMessage(message);
        const response = await fetch(this.apiURL + "auth/verify", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address,
            signature,
            message
          })
        });
        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || "Failed to authenticate");
        }
        const data = await response.json();
        this.token = data.token;
        localStorage.setItem('jwtToken', this.token);
        return this.token;
    }

    async getSessionId() {
        let existingSessionId = localStorage.getItem('sessionId');
        if (existingSessionId) return existingSessionId;
        return await this.newSession();
    }
    
    async newSession() {
        try {
            const response = await fetch(this.apiURL + "chat/new-session", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.token}`  // Using the getter here
                }
            });

            if (!response.ok) {
                throw new Error("Failed to create a new session");
            }

            const data = await response.json();
            const sessionId = data.sessionId;
            localStorage.setItem('sessionId', sessionId);
            return sessionId;
        } catch (error) {
            throw new Error(error);
        }
    }

    
    async loadSession(sessionId) {
      try {
          const response = await fetch(this.apiURL + "chat/load-session/" + `?sessionId=${sessionId}`, {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${this.token}`
              }
          });

          if (!response.ok) {
              throw new Error("Failed to load the existing session");
          }

          const data = await response.json();
          return data; // server should return session data here
      } catch (error) {
          throw new Error(error);
      }
    }

    sendMessage(sessionId, message, callback) {
        console.log("Sending message: " + message + " to session: " + sessionId + " with token: " + this.token);
        this.postRequestSSE(`${this.apiURL}chat/message`, { sessionId, message }, callback);
    }

    postRequestSSE(url, data, callback) {
        // Make the initial POST request
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream', // Ensure we're accepting an SSE stream in the response
            'Authorization': `Bearer ${this.token}` 
          },
          body: JSON.stringify(data),
        })
        .then(response => {
          if(response.headers.get("Content-Type")?.includes("text/event-stream")){
              // The response is an SSE stream
              const reader = response.body?.getReader();
              if (!reader) return;
    
              const decoder = new TextDecoder();
              let messageData = "";

              return reader.read().then(function processText({ done, value }) {
                  if (done) return;

                  // var decoded = decoder.decode(value);
                  messageData += decoder.decode(value, {stream: true});

                  let messageEndIndex = messageData.indexOf("\n\n");
                  if (messageEndIndex !== -1) {
                    let fullMessage = messageData.substring(0, messageEndIndex + 2);
                    messageData = messageData.substring(messageEndIndex + 2);
                    
                    let lines = fullMessage.split('\n');
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            let eventData = JSON.parse(line.slice(6));
                            callback(eventData);
                        }
                    });
                  }

                  // callback(decoded.split('data: "')[1].split('"')[0]);
                  return reader.read().then(processText);
              });
          } else {
            // The response is a regular JSON response
            return response.json();
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
}

export default APIClient;