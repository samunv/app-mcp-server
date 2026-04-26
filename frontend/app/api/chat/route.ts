import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { MODELO, SYSTEM_PROMPT } from "../variables";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import { createMcpClient } from "@/lib/mcp_client";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Un solo cliente para toda la request
    const mcpClient = await createMcpClient();

    const { tools } = await mcpClient.listTools();

    const groqTools = tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: tool.inputSchema.properties,
          required: tool.inputSchema.required ?? [],
        },
      },
    }));

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    while (true) {
      const response = await groq.chat.completions.create({
        model: MODELO,
        messages,
        tools: groqTools,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "stop") {
        await mcpClient.close();
        return NextResponse.json({ reply: choice.message.content });
      }

      if (choice.finish_reason === "tool_calls") {
        messages.push(choice.message);

        for (const toolCall of choice.message.tool_calls!) {
          console.log("Tool llamada:", toolCall.function.name);
          console.log("Argumentos:", toolCall.function.arguments);

          try {
            const result = await mcpClient.callTool({
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
            });
            console.log("Resultado:", JSON.stringify(result));

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          } catch (toolError) {
            console.error("Error en tool:", toolError);
          }
        }
      }
    }

  } catch (error) {
    console.error("Error en /api/chat:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}