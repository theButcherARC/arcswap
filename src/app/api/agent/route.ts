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

/** Parse CSV/multi-line format with support for split amounts */
function tryParseCSV(input: string): { recipients: any[]; token: string; totalAmount: string } | null {
  const text = input.trim();
  
  // Check for "split X$" or "split X USDC" at end
  const splitMatch = text.match(/split\s+([\d.]+)\s*(?:USDC|\$)?(?:\s|$)/i);
  const splitAmount = splitMatch ? parseFloat(splitMatch[1]) : null;
  
  // Remove split instruction from text
  const cleanText = text.replace(/split\s+[\d.]+\s*(?:USDC|\$)?/i, '').trim();
  
  // Split into lines and filter
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^\s*$/));
  
  if (lines.length === 0) return null;
  
  const recipients = [];
  
  for (const line of lines) {
    // Skip if line doesn't contain an address/handle/vibeID
    if (!/0x[a-fA-F0-9]{40}|@\w+|VIBE-\w+/i.test(line)) continue;
    
    // Parse line: extract name, address, and optional amount
    // Patterns: "Name,0x...", "Name,0x...,amount", "0x...,amount", etc.
    const parts = line.split(',').map(p => p.trim()).filter(p => p);
    
    if (parts.length < 2) continue;
    
    // Find address (0x, @, VIBE-)
    const addrIdx = parts.findIndex(p => /^(0x[a-fA-F0-9]{40}|@\w+|VIBE-\w+)$/i.test(p));
    if (addrIdx === -1) continue;
    
    const address = parts[addrIdx];
    
    // Extract name (usually first part)
    let name = parts[0];
    if (addrIdx === 0) {
      name = parts.length > 1 ? parts[1] : "Recipient";
    }
    
    // Extract amount from remaining parts (skip name and address)
    let amount = null;
    for (let i = 0; i < parts.length; i++) {
      if (i !== addrIdx && i !== 0) {
        const numMatch = parts[i].match(/[\d.]+/);
        if (numMatch) {
          amount = numMatch[0];
          break;
        }
      }
    }
    
    // If no amount found in this line, use split amount (will distribute later)
    if (!amount && !splitAmount) {
      amount = "0";
    } else if (!amount && splitAmount) {
      amount = null; // Mark for later distribution
    }
    
    recipients.push({ name: name.substring(0, 50), address, amount });
  }
  
  if (recipients.length === 0) return null;
  
  // If split amount exists, distribute it evenly among recipients with no amount
  let totalAmount = 0;
  if (splitAmount) {
    const amountPerRecipient = splitAmount / recipients.length;
    for (const r of recipients) {
      if (r.amount === null) {
        r.amount = amountPerRecipient.toString();
      }
      totalAmount += parseFloat(r.amount || "0");
    }
  } else {
    totalAmount = recipients.reduce((sum, r) => sum + (parseFloat(r.amount || "0") || 0), 0);
  }
  
  return {
    recipients,
    token: "USDC",
    totalAmount: totalAmount.toString(),
  };
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
        model: "openai/gpt-oss-120b",
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
