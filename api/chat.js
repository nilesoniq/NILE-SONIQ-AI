async function send() {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendButton.disabled = true;

    addMessage(text, "user");
    input.value = "";
    resizeInput();
    showTyping();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: conversationHistory.slice(-12)
            })
        });

        // Read the response as TEXT first.
        // This lets us see exactly what the server returned.
        const rawResponse = await response.text();

        console.log("API status:", response.status);
        console.log("API response:", rawResponse);

        removeTyping();

        let data = null;

        try {
            data = JSON.parse(rawResponse);
        } catch (parseError) {
            throw new Error(
                "Server returned a non-JSON response:\n\n" +
                rawResponse.slice(0, 1000)
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.details ||
                "The AI request failed."
            );
        }

        if (!data.reply || typeof data.reply !== "string") {
            throw new Error(
                data.error ||
                "The AI returned an empty response."
            );
        }

        conversationHistory.push({
            role: "user",
            content: text
        });

        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        addMessage(data.reply, "ai");

    } catch (error) {
        removeTyping();

        console.error("NileSoniQ AI error:", error);

        addMessage(
            "NileSoniQ AI server response:\n\n" +
            (error.message || "Unknown server error"),
            "ai"
        );

    } finally {
        isSending = false;
        sendButton.disabled = false;
        input.focus();
    }
}
