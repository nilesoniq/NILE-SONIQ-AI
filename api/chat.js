module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-12)
      : [];

    const messages = [
      {
        role: "system",
        content:
          "You are NileSoniQ AI, an AI assistant created for NileSoniQ. Be helpful, accurate, clear, and honest. Help with coding, technology, education, business, writing, problem solving, creativity, and general knowledge. Never claim to know everything or be infallible. Do not pretend to have performed actions or accessed information that you have not actually accessed. Give direct, useful answers and explain things clearly.",
      },
      ...safeHistory,
      {
        role: "user",
        content: message,
      },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vercel.com/",
          "X-Title": "NileSoniQ AI",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.4-mini",
          messages,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenRouter could not generate a response.",
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "The AI returned an empty response.",
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Something went wrong while connecting to NileSoniQ AI.",
    });
  }
};
