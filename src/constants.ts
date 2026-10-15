import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

export const TARGET_CHAIN = sepolia;

/** Fixed amount for the plain ETH transfer. */
export const ETH_SEND_AMOUNT = "0.001";

/** How many live Transfer events to keep on screen. */
export const MAX_EVENTS = 15;

/** Quick-pick ERC-20 test tokens on Sepolia. Any other token address can be pasted in. */
export const TOKEN_PRESETS: { symbol: string; address: Address }[] = [
  { symbol: "LINK", address: "0x779877A7B0D9E8603169DdbD7836e478b4624789" },
  { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" },
];
