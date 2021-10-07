import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Modal,
  Stack,
  styled,
  Divider,
  IconButton,
  MenuItem,
  Menu,
} from "@mui/material";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

import { injected } from "../utils/web3Connectors";
import { walletconnect, walletlink } from "../utils/web3ConnectFunctions";
import { conciseAddress } from "../utils/formatters";
import { formatEther } from "@ethersproject/units";

import CloseIcon from "@mui/icons-material/Close";
import Logo from "../assets/Logo.png";
import coinbaseIcon from "../assets/coinbase.png";
import ledgerIcon from "../assets/ledger.png";
import metamaskIcon from "../assets/metamask.png";
import walletConnectIcon from "../assets/walletConnect.png";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EthLogo from "../assets/ETH.png";
import PhnxLogo from "../assets/phnxLogo.png";
import { ToastMsg } from "./Toast";

import Web3 from "web3";
import { abi as PhoenixDaoABI } from "../contract/abi/PhoenixDaoABI.json";
import {
  PHNX_RINKEBY_TOKEN_ADDRESS,
  UNISWAP_CONTRACT_ADDRESS_RINEBY,
  //   urlInfuraMainnet,
  urlInfuraRinkeby,
  //   tokenAddressMainnet,
  tokenAddressRinkeby,
} from "../contract/constants";

const style = {
  position: "absolute",
  maxHeight: "90%",
  overflowY: "auto",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  // border: "2px solid #000",
  boxShadow: 24,
  p: 5,
  display: "flex",
  flexDirection: "column",
  // alignItems: "center",
  borderRadius: 5,
  ["@media (max-width: 650px)"]: {
    width: "90%",
    padding: 2,
  },
};

const Item = styled("button")(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1.5),
  textAlign: "center",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  backgroundColor: "transparent",
  border: "none",
  "&: hover": {
    // border: "1px solid #413AE2",
    backgroundColor: "#D3D3D3",
    borderRadius: 4,
  },
}));

export default function ConnectWallet({ landingScreenBtn }) {
  const web3context = useWeb3React();

  const { account, active, connector, deactivate, library, chainId } =
    web3context;

  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [EthBalance, setEthBalance] = useState(0.0);
  const [PhnxBalance, setPhnxBalance] = useState(0.0);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open2 = Boolean(anchorEl);
  const handleClick2 = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl(null);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    // if (!!account && !!library) {
    //   let stale = false;
    //   library
    //     .getBalance(account)
    //     .then((balance) => {
    //       if (!stale) {
    //         setBalance(balance);
    //       }
    //     })
    //     .catch(() => {
    //       if (!stale) {
    //         setBalance(null);
    //       }
    //     });
    //   return () => {
    //     stale = true;
    //     setBalance(undefined);
    //   };
    // }
  }, [account, library, chainId]);

  const activateWallet = useCallback(
    (connector, onClose = () => {}) => {
      if (
        connector instanceof WalletConnectConnector &&
        connector.walletConnectProvider?.wc?.uri
      ) {
        connector.walletConnectProvider = undefined;
      }

      web3context
        .activate(
          connector
            ? connector
            : new InjectedConnector({
                supportedChainIds: [1, 4],
              }),
          undefined,
          true
        )
        .then(() => {
          // onSuccess();
          handleClose();
          ToastMsg("success", "You are connected to mainnet");
        })
        .catch((e) => {
          const err = getErrorMessage(e);
          // alert(err);
          ToastMsg("error", err);
          // showSnackbarF({ message: err, severity: "error" });
          console.error("ERROR activateWallet -> ", err);
          //   setLoadingF({ walletConnection: false });
        });
    },
    [web3context]
  );

  const deactivateWallet = async () => {
    await deactivate();
    console.log(web3context, "deactivateWallet", active);
    if (connector instanceof WalletConnectConnector) {
      await connector.close();
    }
    if (connector instanceof WalletLinkConnector) {
      await connector.close();
    }

    ToastMsg("warning", "Wallet disconnected");

    // onSuccess();
  };

  const getErrorMessage = (e) => {
    if (e instanceof UnsupportedChainIdError) {
      return "Unsupported Network";
    } else if (e instanceof NoEthereumProviderError) {
      return "No Wallet Found";
    } else if (e instanceof UserRejectedRequestError) {
      return "Wallet Connection Rejected";
    } else if (e.code === -32002) {
      return "Wallet Connection Request Pending";
    } else {
      return "An Error Occurred";
    }
  };

  useEffect(() => {
    if (web3context) {
      const web3 = new Web3(web3context?.library?.currentProvider);

      if (account) {
        web3.eth.getBalance(account).then((ether) => {
          let bal = parseFloat(web3.utils.fromWei(ether, "ether"));
          let res = (
            Math.floor(bal * Math.pow(10, 2)) / Math.pow(10, 2)
          ).toFixed(2);
          setEthBalance(res);
        });
      }

      if (account) {
        const contract = new web3.eth.Contract(
          PhoenixDaoABI,
          PHNX_RINKEBY_TOKEN_ADDRESS
        );

        contract.methods
          .balanceOf(account)
          .call()
          .then((phnx) => {
            let bal = parseFloat(web3.utils.fromWei(phnx, "ether"));
            // console.log('balance phnx :'+bal)
            setPhnxBalance(bal.toFixed(2));
          });
      }
    }
  }, [web3context, account]);

  return (
    <div>
      {/* <span>
        {balance === null ? "Error" : balance ? `Ξ${formatEther(balance)}` : ""}
      </span> */}
      {active && account ? (
        <button className="connect-wallet-btn balance-btn">
          <div
            style={{
              display: "flex",
              alignItem: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={EthLogo}
              alt="EthLogo"
              className="connect-wallet-btn-img"
            ></img>
            {EthBalance}
            &nbsp; | &nbsp;
            <img
              src={PhnxLogo}
              alt="PhnxLogo"
              className="connect-wallet-btn-img"
            ></img>
            {PhnxBalance}
          </div>
        </button>
      ) : null}
      &nbsp;&nbsp;
      <button
        onClick={(e) => {
          !active && !account ? handleOpen() : handleClick2(e);
        }}
        className={
          landingScreenBtn === true
            ? "connect-wallet-btn connect-wallet-btn-reverse"
            : "connect-wallet-btn"
        }
      >
        {active && account ? (
          <div
            style={{
              display: "flex",
              alignItem: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <img
              src={EthLogo}
              alt="EthLogo"
              className="connect-wallet-btn-img"
            ></img>{" "}
            {conciseAddress(account)}{" "}
          </div>
        ) : (
          "  Connect Wallet"
        )}
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="modal-scroll">
          <button onClick={handleClose} className="icon-btn">
            <CloseIcon />
          </button>

          <Stack sx={{ mt: 5, alignItems: "center" }}>
            <img src={Logo} alt="logo" width="192px" height="54px" />
          </Stack>

          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            color="primary"
            sx={{ mt: 3 }}
            align="center"
          >
            Connect to your wallet
          </Typography>

          <Stack spacing={2} sx={{ mt: 5 }}>
            <Item
              onClick={() =>
                !active && !(connector instanceof InjectedConnector)
                  ? activateWallet(injected)
                  : deactivateWallet()
              }
            >
              <img src={metamaskIcon} alt="logo" />
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={{ ml: 3 }}
              >
                {active && connector instanceof InjectedConnector
                  ? "Disconnect Metamask"
                  : "Metamask"}
              </Typography>

              {active && connector instanceof InjectedConnector ? (
                <CheckCircleOutlineIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              ) : (
                <ArrowRightAltIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              )}
            </Item>
            <Divider />
            <Item
              onClick={() => {
                !active && !(connector instanceof WalletConnectConnector)
                  ? activateWallet(walletconnect)
                  : deactivateWallet();
              }}
            >
              <img src={walletConnectIcon} alt="logo" />
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={{ ml: 3 }}
              >
                {active && connector instanceof WalletConnectConnector
                  ? "Disconnect  Wallet Connect"
                  : " Wallet Connect"}
              </Typography>
              {active && connector instanceof WalletConnectConnector ? (
                <CheckCircleOutlineIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              ) : (
                <ArrowRightAltIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              )}
            </Item>
            <Divider />
            <Item
              onClick={() => {
                !active && !(connector instanceof WalletLinkConnector)
                  ? activateWallet(walletlink)
                  : deactivateWallet();
              }}
            >
              <img src={coinbaseIcon} alt="logo" />

              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={{ ml: 3 }}
              >
                {active && connector instanceof WalletLinkConnector
                  ? "Disconnect  Coinbase Wallet"
                  : "Coinbase Wallet"}
              </Typography>
              {active && connector instanceof WalletLinkConnector ? (
                <CheckCircleOutlineIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              ) : (
                <ArrowRightAltIcon
                  sx={{ ml: "auto" }}
                  fontSize="large"
                  color="primary"
                />
              )}
            </Item>
            <Divider />
            <Item>
              <img src={ledgerIcon} alt="logo" />
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                sx={{ ml: 3 }}
              >
                Ledger
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: "auto",
                  color: "#ED2020",
                  background: "#FAEBEB",
                  px: "7px",
                  py: "3px",
                  borderRadius: "30px",
                }}
              >
                COMING SOON
              </Typography>
            </Item>
          </Stack>

          <Typography
            id="modal-modal-title"
            variant="p"
            component="p"
            align="center"
            sx={{ mt: 4 }}
          >
            By connecting, I accept PhoenixDAO’s{" "}
            <Link to="/terms" onClick={handleClose}>
              {" "}
              Terms of service{" "}
            </Link>
          </Typography>
        </Box>
      </Modal>
      <Menu
        anchorEl={anchorEl}
        open={open2}
        onClose={handleClose2}
        onClick={handleClose2}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              // right: 60,
              width: 13,
              height: 13,
              left: 0,
              right: 0,
              marginLeft: "auto",
              marginRight: "auto",
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              // border: "2px solid red",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>Wallet</MenuItem>
        <MenuItem>Transactions</MenuItem>
        <MenuItem>Disconnect</MenuItem>
      </Menu>
    </div>
  );
}
