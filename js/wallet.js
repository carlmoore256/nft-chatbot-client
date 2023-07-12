export class WalletConnection {
    
    // static address = null;
    static connectionListeners = [];

    static get address() {
        const address = localStorage.getItem('walletAddress');
        if (address) {
            return address
        }
        return null;
    }

    static set address(address) {
        if (address) {
            localStorage.setItem('walletAddress', address);
        } else {
            localStorage.removeItem('walletAddress');
        }
    }

    
    static get wallet() {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            throw new Error('MetaMask not installed');
        }
        return window.ethereum;
    }

    static get isConnected() {
        return this.address !== null;
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


export class WalletUI {

    static toggleConnectWalletOverlay(toggle) {
        const overlay = $("#connect-wallet-overlay");
        if (toggle) {
            overlay.show();
        } else {
            console.log("Hiding overlay");
            overlay.hide();
        }
    }


    static toggleWalletStatus(toggle) {
        const walletStatus = $("#wallet-status");
        const statusIndicator = walletStatus.find(".status-indicator");
        const statusText = walletStatus.find(".status-text");
        if (toggle) {
            statusIndicator.removeClass("disconnected");
            statusIndicator.addClass("connected");
            statusText.html("Connected");
            this.toggleConnectWalletOverlay(false);
        } else {
            statusIndicator.removeClass("connected");
            statusIndicator.addClass("disconnected");
            statusText.html("Disconnected");
            this.toggleConnectWalletOverlay(true);
        }
    }

}