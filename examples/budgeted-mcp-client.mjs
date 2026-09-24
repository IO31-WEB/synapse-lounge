/**
 * Synapse Lounge budgeted x402 MCP helper.
 * Usage: MAX_SPEND_USD=0.25 PAYER_PRIVATE_KEY=... node examples/budgeted-mcp-client.mjs
 * Never hard-code a private key. The helper refuses purchases above the session ceiling.
 */
import { privateKeyToAccount } from "viem/accounts";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";

const endpoint = process.env.SYNAPSE_MCP_URL || "https://synapse-lounge.synapse-lounge.workers.dev/mcp";
const maxSpend = Number(process.env.MAX_SPEND_USD || "0.25");
const key = process.env.PAYER_PRIVATE_KEY;
if (!key) throw new Error("PAYER_PRIVATE_KEY is required");
if (!Number.isFinite(maxSpend) || maxSpend < 0) throw new Error("MAX_SPEND_USD must be a non-negative number");
let committed = 0;
const account = privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const paidFetch = wrapFetchWithPayment(globalThis.fetch, client);

export async function callPaidMcpExact(requestBody, expectedPriceUsd) {
  if (committed + expectedPriceUsd > maxSpend + 1e-9) throw new Error(`MAX_SPEND_USD exceeded: ${committed.toFixed(3)} + ${expectedPriceUsd.toFixed(3)} > ${maxSpend.toFixed(3)}`);
  const body = JSON.stringify(requestBody); // keep exact bytes for recovery
  const make = () => paidFetch(endpoint, { method:"POST", headers:{"content-type":"application/json","accept":"application/json, text/event-stream"}, body });
  let response;
  try { response = await make(); }
  catch (firstError) {
    // Recovery rule: retry the exact same request bytes. The x402 client can reuse/recover
    // the original authorization flow instead of the caller constructing a second purchase.
    response = await make();
  }
  if (response.ok) committed += expectedPriceUsd;
  return { response, spend: { committed_usd:Number(committed.toFixed(6)), max_spend_usd:maxSpend, remaining_usd:Number((maxSpend-committed).toFixed(6)) } };
}

console.log(JSON.stringify({ready:true,payer:account.address,max_spend_usd:maxSpend,endpoint},null,2));
