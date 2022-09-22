import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { URL_INFURA_MAINNET, URL_INFURA_RINKEBY, URL_INFURA_POLYGON_MAINNET, URL_INFURA_OPTIMISM_MAINNET } from "../contract/constant";

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: URL_INFURA_MAINNET,
    4: URL_INFURA_RINKEBY,
    10: URL_INFURA_OPTIMISM_MAINNET,
    137: URL_INFURA_POLYGON_MAINNET,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000,
});

export const walletlink = new WalletLinkConnector({
  url: [URL_INFURA_MAINNET, URL_INFURA_RINKEBY, URL_INFURA_OPTIMISM_MAINNET, URL_INFURA_POLYGON_MAINNET],
  appName: "ExzoSwap API",
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001],
  //supportedChainIds: [1, 4],
});