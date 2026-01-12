import { createContext, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Signer } from "@nillion/nuc";
import { createWalletClient, custom } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { AuthFlowManager } from "./AuthFlowManager";

import { usePersistedConnection } from "../hooks/usePersistedConnection";

const initialState = {
  signer: null,
  did: null,
  wallets: {
    isMetaMaskConnected: false,
    metaMaskAddress: null,
  },
};

export const NillionContext = createContext(null);

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Create wallet client with viem
  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.requestAddresses();

  // Create Nillion NUC Signer from MetaMask
  const nucSigner = Signer.fromWeb3({
    getAddress: async () => account,
    signTypedData: async (domain, types, message) => {
      return walletClient.signTypedData({
        account,
        domain,
        types,
        primaryType: Object.keys(types).find(k => k !== "EIP712Domain"),
        message,
      });
    },
  });

  // Generate DID from signer
  const did = await nucSigner.getDid();
  console.log("User DID:", did.didString);

  return { signer: nucSigner, did: did.didString, address: account };
};

export function NillionProvider({ children }) {
  const [state, setState] = useState(initialState);
  const {
    hasConnected,
    setMetaMaskConnected,
    clearAll: clearPersistedConnection,
  } = usePersistedConnection();
  const reconnectIdempotencyRef = useRef(false);
  const queryClient = useQueryClient();

  const connectMetaMask = useCallback(async () => {
    console.log("[Nillion] Connecting to MetaMask...");
    if (!window.ethereum) {
      console.error("[Nillion] MetaMask is not installed.");
      return;
    }
    try {
      const eth = window.ethereum;
      const metaMaskProvider = (eth?.providers?.find((p) => p?.isMetaMask) ?? eth);

      // Detect active chain and align client to avoid chainId mismatch errors
      const chainIdHex = await metaMaskProvider.request({ method: "eth_chainId" });
      const activeChainId = Number(chainIdHex);
      const activeChain = activeChainId === 1 ? mainnet : activeChainId === 11155111 ? sepolia : mainnet;

      const walletClient = createWalletClient({
        chain: activeChain,
        transport: custom(metaMaskProvider),
      });
      const [account] = await walletClient.requestAddresses();

      const nucSigner = Signer.fromWeb3({
        getAddress: async () => account,
        signTypedData: async ({ domain, types, primaryType, message }) => {
          const normalizedDomain = { ...domain };
          // If the domain specifies a chainId, switch to it before signing
          const domainChainId = Number(normalizedDomain?.chainId);
          if (!Number.isNaN(domainChainId) && domainChainId !== activeChainId) {
            try {
              const hex = `0x${domainChainId.toString(16)}`;
              await metaMaskProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: hex }],
              });
            } catch (switchErr) {
              // If switching fails, try signing anyway
            }
          }
          return walletClient.signTypedData({
            account,
            domain: normalizedDomain,
            types,
            primaryType,
            message,
          });
        },
      });

      const did = await nucSigner.getDid();
      setState((prev) => ({
        ...prev,
        signer: nucSigner,
        did: did.didString,
        wallets: {
          ...prev.wallets,
          isMetaMaskConnected: true,
          metaMaskAddress: account,
        },
      }));
      setMetaMaskConnected();
      console.log(`[Nillion] MetaMask connected: ${account}`);
    } catch (e) {
      const err = e;
      const code = err?.code ? ` (code ${err.code})` : "";
      const details = err?.data?.message || err?.message || String(err);
      console.error("[Nillion] MetaMask connection failed." + code, details);
    }
  }, [setMetaMaskConnected]);

  const logout = useCallback(() => {
    setState(initialState);
    clearPersistedConnection();
    queryClient.removeQueries({ queryKey: ["session"] });
    console.log("[Nillion] Session disconnected.");
  }, [clearPersistedConnection, queryClient]);

  // Auto-reconnect effect (only run once on mount)
  useEffect(() => {
    if (reconnectIdempotencyRef.current) return;
    reconnectIdempotencyRef.current = true;

    const reconnect = async () => {
      if (hasConnected.metaMask && !state.wallets.isMetaMaskConnected) {
        await connectMetaMask();
      }
    };
    reconnect().catch(console.error);
  }, [
    connectMetaMask,
    hasConnected.metaMask,
    state.wallets.isMetaMaskConnected,
  ]);

  const contextValue = useMemo(
    () => ({
      state,
      connectMetaMask,
      logout,
    }),
    [state, connectMetaMask, logout],
  );

  return (
    <NillionContext.Provider value={contextValue}>
      <AuthFlowManager />
      {children}
    </NillionContext.Provider>
  );
}