import type { Address, Hash } from "viem";

/** A decoded ERC-20 Transfer event as shown in the live feed. */
export type TransferEvent = {
  id: string;
  hash: Hash;
  from: Address;
  to: Address;
  value: bigint;
};

/** The subset of a decoded Transfer log we rely on. */
export type RawTransferLog = {
  transactionHash: Hash | null;
  logIndex: number | null;
  args: { from?: Address; to?: Address; value?: bigint };
};
