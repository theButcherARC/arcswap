// src/app/api/agent/route.ts
// Server-side Next.js API route - keeps GROQ_API_KEY secret

import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/services/agentService";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Resolve identifier (0x, @handle, or VIBE-ID) to wallet address */
async function resolveIdentifier(identifier: string, baseUrl: string): Promise<string | null> {
  const trimmed = identifier.trim();
  
  // Already a wallet address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed;
  }
  
  // VibeID or X handle — resolve via /api/social/resolve
  if (/^(VIBE-|@)/i.test(trimmed)) {
    try {
      const url = `${baseUrl}/api/social/resolve?username=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.address) {
        return data.address;
      }
    } catch (e) {
      console.error("[v0] Resolve identifier error:", e);
    }
    return null;
  }
  
  return null;
}

/** Try to parse CSV/multi-line format directly */
function tryParseCSV(input: string): { recipients: any[]; token: string; totalAmount: string } | null {
  const lines = input.trim().split('\n').filter(l => l.trim());
  
  // Detect if this looks like CSV: multiple lines with addresses
  const hasMultipleLines = lines.length > 1;
  const looksLikeCSV = lines.some(line => /0x[a-fA-F0-9]{40}|@\w+|VIBE-\w+/.test(line));
  
  if (!hasMultipleLines || !looksLikeCSV) {
    return null;
  }
  
  const recipients = [];
  let totalAmount = "0";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Parse: "Name, 0x... , amount" OR "Name, 0x..." OR "0x..., amount"
    const parts = trimmed.split(',').map(p => p.trim()).filter(p => p);
    
    if (parts.length < 2) continue;
    
    // Find the address/identifier (0x, @, or VIBE-)
    const addrIdx = parts.findIndex(p => /^(0x[a-fA-F0-9]{40}|@\w+|VIBE-\w+)$/.test(p));
    if (addrIdx === -1) continue;
    
    const address = parts[addrIdx];
    const name = parts[0];
    
    // Look for amount - could be "$X", "X USDC", or just "X"
    let amount = "0";
    for (let i = 0; i < parts.length; i++) {
      if (i !== addrIdx && i !== 0) {
        const amountMatch = parts[i].match(/[\d.]+/);
        if (amountMatch) {
          amount = amountMatch[0];
          break;
        }
      }
    }
    
    recipients.push({ name, address, amount });
  }
  
  if (recipients.length === 0) {
    return null;
  }
  
  // Calculate total
  const total = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  totalAmount = total.toString();
  
  return { recipients, token: "USDC", totalAmount };
}

export async function POST(req: NextRequest) {
  try {
    const { instruction } = await req.json();

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json(
        { error: "Missing instruction" },
        { status: 400 }
      );
    }

    // Get base URL for internal API calls
    const baseUrl = req.nextUrl.origin;

    // Try direct CSV parsing first
    const csvParsed = tryParseCSV(instruction);
    if (csvParsed && csvParsed.recipients.length > 0) {
      // Validate and resolve CSV-parsed data
      const resolved = [];
      for (const recipient of csvParsed.recipients) {
        const walletAddress = await resolveIdentifier(recipient.address, baseUrl);
        if (!walletAddress) {
          return NextResponse.json(
            {
              recipients: [],
              token: "USDC",
              totalAmount: "0",
              error: `Invalid identifier: ${recipient.address}. Use wallet address (0x...), X handle (@username), or VibeID (VIBE-XXXXX).`,
            },
            { status: 200 }
          );
        }
        resolved.push({
          ...recipient,
          address: walletAddress,
        });
      }
      return NextResponse.json({
        recipients: resolved,
        token: csvParsed.token,
        totalAmount: csvParsed.totalAmount,
      });
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

    // Resolve all identifiers to wallet addresses
    if (parsed.recipients && Array.isArray(parsed.recipients)) {
      const resolved = [];
      for (const recipient of parsed.recipients) {
        const walletAddress = await resolveIdentifier(recipient.address, baseUrl);
        if (!walletAddress) {
          return NextResponse.json(
            {
              recipients: [],
              token: "USDC",
              totalAmount: "0",
              error: `Could not resolve identifier: ${recipient.address}. Use wallet address (0x...), X handle (@username), or VibeID (VIBE-XXXXX).`,
            },
            { status: 200 }
          );
        }
        resolved.push({
          ...recipient,
          address: walletAddress,
        });
      }
      parsed.recipients = resolved;
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
