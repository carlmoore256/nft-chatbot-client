export class WalletConnection {
    
    static address = null;
    static connectionListeners = [];

    static get wallet() {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            throw new Error('MetaMask not installed');
        }
        return window.ethereum;
    }

    static addListener(listener) {
        this.connectionListeners.push(listener);
    }

    static removeListener(listener) {
        const index = this.connectionListeners.indexOf(listener);
        if (index !== -1) {
            this.connectionListeners.splice(index, 1);
        }
    }
    
    static async connect() {
        if (this.address) {
            console.log("Wallet already connected");
            return;
        }
        const accounts = await this.wallet.request({ method: 'eth_requestAccounts' });
        this.address = accounts[0]; // The first account in MetaMask
        this.connectionListeners.forEach(listener => listener(this.address, true));
    }
    
    static disconnect() {
        this.address = null;
        this.connectionListeners.forEach(listener => listener(this.address, false));
    }

    static async signMessage(message) {
        const signature = await this.wallet.request({
            method: 'personal_sign',
            params: [message, this.address]
        });
        return signature;
    }
}