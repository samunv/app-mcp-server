import { useState } from "react";
export function useChat() {
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    // Añadir el mensaje del usuario
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error del servidor:", text);
      setLoading(false);
      return;
    }

    const data = await res.json();

    // Luego añadir la respuesta del asistente
    setMessages((prev) => [...prev, { role: "system", content: data.reply }]);
    setLoading(false);
  };

  return { messages, loading, sendMessage };
}
