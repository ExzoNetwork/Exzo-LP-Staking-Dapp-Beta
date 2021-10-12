import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Modal,
  Box,
  TextField,
  // InputAdornment,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ComponentCss from "../componentCss.css";
import PhnxLogo from "../../assets/phnxLogo.png";
import EthLogo from "../../assets/ETH1.png";
import * as SERVICE from "../../services/pool.services";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { ToastMsg } from "../Toast";
import Web3 from "web3";
import { abi } from "../../contract/abi/PhoenixDaoABI.json";
import { GetPoolPositionAction } from "../../redux/actions/contract.actions";
import { useSelector, useDispatch } from "react-redux";

const LiquidityModal = ({ isVisible, handleClose, closeBtn }) => {
  const [ethValue, setEthValue] = useState();
  const [phnxValue, setPhnxValue] = useState();

  const [EthBalance, setEthBalance] = useState(0.0);
  const [PhnxBalance, setPhnxBalance] = useState(0.0);

  const [ethPerPhnx, setEthPerPhnx] = useState(0);
  const [phnxPerEth, setPhnxPerEth] = useState(0);

  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0); //phnx

  const [poolShare, setPoolShare] = useState(0);

  const [allowance, setAllowance] = useState(0);

  const web3context = useWeb3React();
  const dispatch = useDispatch();
  // const mainData = useSelector((state) => state.localReducer.mainData);
  const contractUniswapPair = useSelector(
    (state) => state.contractReducer.contractUniswapPair
  );
  const contractUniswapRouter = useSelector(
    (state) => state.contractReducer.contractUniswapRouter
  );

  const contractPhnxDao = useSelector(
    (state) => state.contractReducer.contractPhnxDao
  );
  const poolPositionState = useSelector(
    (state) => state.contractReducer.poolPosition
  );

  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState("");

  useEffect(() => {
    _handleGetDataMain();
  }, []);

  useEffect(() => {
    if (web3context.active && web3context.account) {
      _handleGetPoolPosition();
      _handleCheckApproval();
    }
  }, [
    web3context.active,
    web3context.account,
    // contractPhnxDao,
    contractUniswapPair,
  ]);

  useEffect(() => {
    console.log("poolPositionState", poolPositionState);
  }, [poolPositionState]);

  const _handleGetDataMain = async () => {
    try {
      let result = await SERVICE.getDataMain();
      setPhnxPerEth(result.route.midPrice.toSignificant(6));
      setEthPerPhnx(result.route.midPrice.invert().toSignificant(6));
      setReserve0(result.pair.reserveO);
      setReserve1(result.pair.reserve1.toFixed(2));
    } catch (e) {
      console.error("Error _handleGetDataMain", e);
    }
  };

  const _handleGetPoolPosition = async () => {
    dispatch(GetPoolPositionAction(web3context, contractUniswapPair));
  };
  const _handleCheckApproval = async () => {
    // console.log("contract123 ", contractPhnxDao);
    try {
      setLoading(true);
      let result = await SERVICE.checkApproval(web3context, contractPhnxDao);
      console.log("allowance", allowance);
      setAllowance(result);
    } catch (e) {
      console.error("_handleCheckApproval", e);
      ToastMsg("error", "First give approval!");
    } finally {
      setLoading(false);
    }
  };

  const _handleGiveApproval = async () => {
    try {
      setLoading(true);
      await SERVICE.giveApproval(web3context, contractPhnxDao);
      // ToastMsg("success", "Approved successfully!");
    } catch (e) {
      ToastMsg("error", "Failed to give approval!");
      console.error("Error _handleGiveApproval", e);
    } finally {
      setLoading(false);
    }
  };

  const _handleSupply = async () => {
    try {
      setLoading(true);
      await SERVICE.supply(
        phnxValue,
        ethValue,
        web3context,
        contractUniswapRouter
      );
    } catch (e) {
      ToastMsg("error", "Couldn't add liquidity");
      console.error("Error _handleSupply", e);
    } finally {
      setLoading(false);
      setPhnxValue("");
      setEthValue("");
      setPoolShare(0);
    }
  };

  const OnChangeHandler = (val, tokenName) => {
    if (tokenName === "phnx") {
      let v = parseFloat(val);
      let total = parseFloat(reserve1) + v;
      setPoolShare((v / total) * 100);
      setPhnxValue(v);
      setEthValue(parseFloat(ethPerPhnx) * v || num);
    } else {
      let v = parseFloat(val);
      let total = parseFloat(phnxPerEth) * v;
      total = total + parseFloat(reserve1);
      setPoolShare(((parseFloat(phnxPerEth) * v) / total) * 100);
      setEthValue(v);
      setPhnxValue(parseFloat(phnxPerEth) * v || num);
    }
  };

  const { account, active, connector, deactivate, library, chainId } =
    web3context;

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
          abi,
          "0xfe1b6abc39e46cec54d275efb4b29b33be176c2a"
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
    <Box sx={styles.containerStyle} className="modal-scroll">
      <div style={{ paddingLeft: 10 }}>
        <div style={styles.divTopHeading}>
          <p className="heading-modal">Add Liquidity</p>
          <p className="subheading-modal">
            Add liquidity to the ETH/PHNX pool <br /> and receive LP tokens
          </p>

          {closeBtn ? (
            <button onClick={handleClose} className="icon-btn">
              <CloseIcon />
            </button>
          ) : null}
        </div>
      </div>
      <div
        style={{
          height: 1,
          background: "rgba(0, 0, 0, 0.15)",
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 9,
        }}
      />
      <div
        className="dialog-style"
        // style={styles.dialogStyle}
      >
        <div style={styles.containerTip}>
          <Typography style={styles.txtTipParagraph}>
            Tip: By adding liquidity, you'll earn 0.25% of all trades on this
            pair proportional to your share of the pool. Fees are added to the
            pool, accrue in real time and can be claimed by withdrawing your
            liquidity.
          </Typography>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="token-container"
            // style={styles.tokenContainer}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <img alt="logo" style={styles.imgLogoPhnx} src={PhnxLogo} />
              <div style={styles.containerImg}>
                <Typography style={styles.txtInput}>Input</Typography>
                <Typography style={styles.txtPhnx}>PHNX ↓</Typography>
              </div>
            </div>
            <div style={styles.containerInput}>
              <div style={styles.divPhnxAmount}>
                <Typography style={styles.txtInput}>Available PHNX:</Typography>
                <Typography style={styles.txtAmount}>
                  {PhnxBalance} PHNX
                </Typography>
              </div>
              <div
                className="wrapper-input"
                // style={styles.wrapperInput}
              >
                <TextField
                  hiddenLabel
                  id="standard-adornment-weight"
                  size="small"
                  placeholder="0.0"
                  background="rgba(195, 183, 255, 0.17);"
                  value={phnxValue}
                  // disabled={ethPerPhnx > 0 && phnxPerEth > 0 ? false : true}
                  type="number"
                  onChange={(event) => {
                    // if(parseFloat(event.target.value) > parseFloat(PhnxBalance)){
                    //   return;
                    // }
                    OnChangeHandler(event.target.value, "phnx");
                  }}
                  style={styles.inputStyle}
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        style={styles.iconBtn}
                        onClick={() => {
                          OnChangeHandler(PhnxBalance, "phnx");
                        }}
                      >
                        MAX
                      </IconButton>
                    ),
                    disableUnderline: true,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.containerAddDiv}>
            <div
              className="add-div"
              // style={styles.addDiv}
            >
              +
            </div>
          </div>

          <div
            className="token-container"
            // style={styles.tokenContainer}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <img
                alt="logo"
                style={styles.imgLogoPhnx}
                src={EthLogo}
              />
              <div style={styles.containerImg}>
                <Typography style={styles.txtInput}>Input</Typography>
                <Typography style={{ ...styles.txtPhnx, color: "#454A75" }}>
                  ETH ↓
                </Typography>
              </div>
            </div>
            <div style={styles.containerInput}>
              <div style={styles.divPhnxAmount}>
                <Typography style={styles.txtInput}>Available ETH:</Typography>
                <Typography style={styles.txtAmount}>
                  {EthBalance} ETH
                </Typography>
              </div>
              <div
                className="wrapper-input"
                // style={styles.wrapperInput}
              >
                <TextField
                  hiddenLabel
                  id="standard-adornment-weight"
                  size="small"
                  placeholder="0.0"
                  background="rgba(195, 183, 255, 0.17)"
                  value={ethValue}
                  // disabled={ethPerPhnx > 0 && phnxPerEth > 0 ? false : true}
                  type="number"
                  onChange={(event) => {
                    // if(parseFloat(event.target.value) > parseFloat(EthBalance)){
                    //   return;
                    // }
                    OnChangeHandler(event.target.value, "eth");
                  }}
                  style={styles.inputStyle}
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        style={styles.iconBtn}
                        onClick={() => {
                          OnChangeHandler(EthBalance, "eth");
                        }}
                      >
                        MAX
                      </IconButton>
                    ),
                    disableUnderline: true,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container-pool-share">
          <div style={styles.txtDivPhEth}>
            <Typography style={styles.txtConvDetails}>
              <b>{phnxPerEth ? phnxPerEth : "_ _"}</b> PHNX/ETH
            </Typography>
            <Typography style={styles.txtConvDetails}>
              <b>{ethPerPhnx ? ethPerPhnx : "_ _"}</b> ETH/PHNX
            </Typography>
          </div>
          <div className="pool-share">
            <Typography style={styles.txtConvDetails}>
              less than <b>{poolShare ? poolShare.toFixed(2) : "0"}%</b>
            </Typography>
            <Typography style={styles.txtConvDetails}>pool share</Typography>
          </div>
        </div>
        {/* <p>{allowance}</p> */}
        {allowance == 0 ? (
          <Button
            variant="contained"
            size="large"
            fullWidth={true}
            style={{
              ...styles.btnAddLiquidity,
              backgroundColor: loading ? "#eee" : "#413AE2",
              textTransform: 'capitalize',
            }}
            disabled={loading}
            onClick={_handleGiveApproval}
          >
            Approve PHNX
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            fullWidth={true}
            style={{
              ...styles.btnAddLiquidity,
              backgroundColor:
                loading ||
                phnxValue > PhnxBalance ||
                ethValue > EthBalance ||
                phnxValue === 0 ||
                ethValue === 0 ||
                phnxValue == "" ||
                ethValue == ""
                  ? "#eee"
                  : "#413AE2",
            }}
            disabled={
              loading ||
              phnxValue > PhnxBalance ||
              ethValue > EthBalance ||
              phnxValue === 0 ||
              ethValue === 0 ||
              phnxValue == "" ||
              ethValue == ""
            }
            onClick={_handleSupply}
          >
            {phnxValue > PhnxBalance || ethValue > EthBalance
              ? "Insufficient Balance"
              : "Add Liquidity"}
          </Button>
        )}
      </div>
    </Box>
  );
};

export default LiquidityModal;

const styles = {
  containerStyle: {
    position: "absolute",
    maxHeight: "90%",
    overflowY: "scroll",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "#fff",
    padding: 20,
    // border: "2px solid #000",
    borderRadius: 5,
    boxShadow: 0,
    p: 4,
    ["@media (max-width: 650px)"]: {
      width: "90%",
      padding: 2,
    },
  },
  containerAddDiv: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    left: 0,
    right: 0,
    top: 0,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "transparent",
    display: "flex",
    alignItem: "center",
    justifyContent: "center",
    top: "50%",
    transform: 'translateY(-50%)',
  },
  // dialogStyle: {
  //   padding: "10px 10px 0px 10px",
  // boxShadow: "0px 10px 80px 10px rgba(0, 0, 0, 0.06)",
  // },
  divTopHeading: {
    display: "flex",
    flexDirection: "column",
  },
  containerTip: {
    display: "flex",
    width: "100%",
    padding: "9px 15px",
    background:
      "linear-gradient(90deg, rgba(56, 16, 255, 0.55) 0%, rgba(255, 0, 245, 0.55) 143.12%)",
    borderRadius: 15,
    // marginBottom: 20,
  },
  txtTipParagraph: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  btnAddLiquidity: {
    backgroundColor: "#413AE2",
    margin: "25px 0px 30px 0px",
    height: 45,
    borderRadius: 12,
  },
  tokenContainer: {
    display: "flex",
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "15px 10px 15px 15px",
    backgroundColor: "rgba(195, 183, 255, 0.17)",
    border: "1px solid #E2E1FF",
    borderRadius: 20,
    marginTop: 15,
    // height: 95,
  },
  containerImg: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 8,
  },
  imgLogoPhnx: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  txtPhnx: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#413AE2",
  },
  containerInput: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  txtAmount: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  divPhnxAmount: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  inputStyle: {
    // width: 150,
    size: 12,
    background: "rgba(195, 183, 255, 0.17)",
    border: "none",
    padding: "7px 8px 5px 8px",
    borderRadius: 8,
    fontWeight: '800 !important',
  },
  wrapperInput: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  txtDivPhEth: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  txtConvDetails: {
    fontSize: 16,
    fontWeight: 500,
    color: "#62688F",
  },
  txtInput: {
    color: "#707070",
    fontSize: 13,
  },
  iconBtn: {
    height: 25,
    backgroundColor: "#C3B7FF",
    borderRadius: 5,
    color: "#413AE2",
    fontSize: 9,
  },
};
