import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";

const privateKey = process.env.PAYER_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("PAYER_PRIVATE_KEY environment variable is not set.");
}

const account = privateKeyToAccount(
  privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
);

console.log("Payer:", account.address);
console.log("Endpoint: https://synapse-lounge.synapse-lounge.workers.dev/api/x402");
console.log("Maximum expected payment: $0.01 USDC on Base");

const client = new x402Client().register(
  "eip155:8453",
  new ExactEvmScheme(account)
);

const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);

const response = await fetchWithPayment(
  "https://synapse-lounge.synapse-lounge.workers.dev/api/x402"
);

console.log("\nHTTP status:", response.status);
console.log("PAYMENT-RESPONSE:", response.headers.get("PAYMENT-RESPONSE"));

const body = await response.text();

console.log("\nResponse:");
console.log(body);