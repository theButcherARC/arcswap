// src/app/api/agent/route.ts
// Server-side Next.js API route - keeps GROQ_API_KEY secret

import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/services/agentService";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { instruction } = await req.json();

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json(
        { error: "Missing instruction" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: instruction,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return NextResponse.json(
        { error: "Groq API error: " + groqRes.status },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const rawText = groqData?.choices?.[0]?.message?.content ?? "";

    // Strip any markdown fences if Groq adds them
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          recipients: [],
          token: "USDC",
          totalAmount: "0",
          error: "Could not parse AI response. Try rephrasing.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Agent route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
