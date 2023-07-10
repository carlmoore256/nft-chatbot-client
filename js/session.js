export class Session {

    get sessionId() {
        return localStorage.getItem('sessionId');
    }

    set sessionId(sessionId) {
        localStorage.setItem('sessionId', sessionId);
    }

    get jwtToken() {
        return localStorage.getItem('jwtToken');
    }

    set jwtToken(token) {
        localStorage.setItem('jwtToken', token);
    }

}