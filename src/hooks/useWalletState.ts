import { useConnection } from "wagmi";
import { TARGET_CHAIN } from "../constants";

/** Connection info plus whether the wallet is currently on the supported chain. */
export function useWalletState() {
  const { address, chainId, isConnected } = useConnection();
  return {
    address,
    chainId,
    isConnected,
    onSepolia: isConnected && chainId === TARGET_CHAIN.id,
  };
}
