import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Sepolia is the only supported chain, so the app can never touch Mainnet by accident.
export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    // `undefined` falls back to the chain's default public RPC.
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || undefined),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
