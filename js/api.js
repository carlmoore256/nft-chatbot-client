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

        if (!window.ethereum || !window.ethereum.isMetaMask) {
          throw new Error('MetaMask not installed');
        }
    
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0]; // The first account in MetaMask
        this.walletAddress = address;
        const message = await this.getNonceMessage(address);
    
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address]
        });

        console.log("Signature: " + signature);
    
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
            // Capture the error message from the server
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

    sendMessage(sessionId, message) {
        console.log("Sending message: " + message + " to session: " + sessionId + " with token: " + this.token);
        const eventSource = new EventSource(
            `${this.apiURL}chat/message?sessionId=${encodeURIComponent(sessionId)}&message=${encodeURIComponent(message)}`,
            { headers: { Authorization: `Bearer ${this.token}` } }  // Using the getter here
        );
        return eventSource;
    }
}

