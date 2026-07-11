// src/services/agentService.ts
// VibeAI - parses natural language into BulkPay recipient data

export interface ParsedRecipient {
  name: string;
  address: string;
  amount: string;
}

export interface ParsedBulkPay {
  recipients: ParsedRecipient[];
  token: string;
  totalAmount: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a payment parser for VibeFlow, a USDC batch payment platform on Arc blockchain.

Parse natural language payment instructions into structured JSON.

Rules:
- Extract recipient name, wallet address (0x...), and amount in USDC
- If a percentage is given and total amount is mentioned, calculate individual amounts
- Token defaults to "USDC" unless EURC or cirBTC is explicitly mentioned
- Wallet addresses must start with 0x and be 42 characters
- If amounts are given as percentages, calculate from total
- Return ONLY valid JSON, no markdown, no explanation

Output format:
{
  "recipients": [
    { "name": "string", "address": "0x...", "amount": "string" }
  ],
  "token": "USDC",
  "totalAmount": "string"
}

If you cannot parse, return:
{ "recipients": [], "token": "USDC", "totalAmount": "0", "error": "description of what is missing" }`;

export async function parsePaymentInstruction(
  instruction: string
): Promise<ParsedBulkPay> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction }),
  });

  if (!response.ok) {
    throw new Error("Agent API request failed: " + response.status);
  }

  const data = await response.json();

  if (data.error && !data.recipients) {
    throw new Error(data.error);
  }

  return data as ParsedBulkPay;
}

export { SYSTEM_PROMPT };
