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

Parse natural language payment instructions, CSV data, or structured lists into JSON recipient data.

Parsing Rules:
- Extract recipient name, identifier (wallet address 0x..., X handle @username, or VibeID VIBE-XXXXX), and amount in USDC
- Handle multiple formats: natural language ("Pay Alice 100 to @bob"), CSV rows, or multi-line lists
- CSV Format: name, address, amount OR name, address (with default amount)
- Multi-line Format: Each line is "name, address, amount" or "name - address - amount"
- If a percentage is given and total amount is mentioned, calculate individual amounts
- Token defaults to "USDC" unless EURC or cirBTC is explicitly mentioned
- Identifiers can be:
  * Wallet addresses: 0x followed by 40 hex characters
  * X/Twitter handles: @ followed by username (e.g. @alice)
  * VibeID: VIBE- followed by alphanumerics (e.g. VIBE-ABC123)
- If amounts are given as percentages, calculate from total
- If "each" is specified with an amount, apply that amount to all recipients
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
