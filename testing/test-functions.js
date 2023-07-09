function testChatSession() {
    APIClient.reset();
    ChatSession.create()
        .then((session) => {
            session.sendMessage("Hello");
        }).catch((error) => {
            console.log("Error: " + error);
        });
}