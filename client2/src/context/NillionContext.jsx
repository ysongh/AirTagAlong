import { Signer } from "@nillion/nuc";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Create wallet client with viem
  const walletClient = createWalletClient({
    chain: mainnet,
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