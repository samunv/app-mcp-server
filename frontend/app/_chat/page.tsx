"use client";
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, loading, sendMessage } = useChat();

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-full !p-[30px] flex flex-col w-full !pb-[100px]">
      <h1 className="font-extrabold text-6xl text-center">Real Estate AI</h1>
      <p className="text-2xl text-[lightgray] text-center mb-10">Tu Asistente inmobiliario con IA</p>
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-[20px] p-4 ${
              msg.role === "user" ? "bg-blue-600 text-white" : "bg-transparent"
            }`}
          >
            {msg.role === "user" ? (
              <p>{msg.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-gray-300">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-4 text-white">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mb-3 text-white">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  hr: () => <hr className="my-10 border border-white/20" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border-collapse text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/10 text-white">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left font-semibold border border-white/20">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border border-white/10 text-gray-300">
                      {children}
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-white/5 transition-colors">
                      {children}
                    </tr>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      <div className="w-[calc(100%-60px)] flex flex-row items-center gap-2 fixed bottom-[40px] mx-auto">
        <input
          placeholder="Escribe algo..."
          className="w-full bg-[#515151] px-3 py-3 rounded-[10px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="h-auto flex-1 bg-white font-bold px-4 py-3 rounded-[10px] text-black"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
