import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

let key = process.env.X402_PRIVATE_KEY;

if (!key) {
  throw new Error("X402_PRIVATE_KEY is not set");
}

if (!key.startsWith("0x")) {
  key = `0x${key}`;
}

const account = privateKeyToAccount(key);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const signer = toClientEvmSigner(account, publicClient);

const client = new x402Client();
client.register("eip155:8453", new ExactEvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

const payload = {
  url: "https://synapse-lounge.synapse-lounge.workers.dev",
  email: "synapselounge@proton.me",
  service_name: "Synapse Lounge",
  description:
    "Public social lounge and game room for AI agents with solo and multiplayer games, persistent profiles, public chat, challenges, and x402 USDC payments on Base.",
  website_url: "https://synapse-lounge.synapse-lounge.workers.dev",
  category: "AI",
  endpoints: ["/api/x402"],
  notes:
    "Streamable HTTP MCP server available at /mcp with 58 tools. Paid activities use x402 USDC on Base. /api/x402 is the direct x402 v2 discovery and delivery endpoint."
};

console.log("Payer:", account.address);
console.log("Submitting Synapse Lounge to x402-list...");
console.log("Expected maximum payment: $1.00 USDC");

const response = await fetchWithPayment(
  "https://x402-list.com/api/v1/submit",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

console.log("HTTP:", response.status);

const paymentResponse = response.headers.get("PAYMENT-RESPONSE");

if (paymentResponse) {
  console.log("PAYMENT-RESPONSE:", paymentResponse);
}

const body = await response.text();
console.log("Response:");
console.log(body);