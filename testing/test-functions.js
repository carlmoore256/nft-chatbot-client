(function testChatSession() {
    if (!window.env) {
        throw new Error("window.env is not defined");
    }
    APIClient.reset();
    ChatSession.create(new APIClient(window.env.API_URL))
        .then((session) => {
            session.sendMessage("Hello");
        }).catch((error) => {
            console.log("Error: " + error);
        });
})();