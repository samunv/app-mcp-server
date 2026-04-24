import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { MODELO, SYSTEM_PROMPT } from "../variables";
import { getTools, callTool } from "@/lib/mcp_client";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // 1. Obtienes tools del MCP y las conviertes a formato Groq
  const mcpTools = await getTools();
  const groqTools = mcpTools.map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: message },
  ];

  //  Bucle hasta que Groq responda sin tool calls
  while (true) {
    const response = await groq.chat.completions.create({
      model: MODELO,
      messages,
      tools: groqTools,
    });

    const choice = response.choices[0];

    if (choice.finish_reason === "stop") {
      return NextResponse.json({ reply: choice.message.content });
    }

    if (choice.finish_reason === "tool_calls") {
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls!) {
        const result = await callTool(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  }
}