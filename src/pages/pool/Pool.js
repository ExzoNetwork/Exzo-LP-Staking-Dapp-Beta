import React, { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import PoolCss from "./Pool.css";
import handsImg from "../../assets/handPic.svg";
import landingImg from "../../assets/landingScreenLogo.svg";
import { Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
// import { Web3InitAction } from "../../redux/actions/local.actions";
import { ToastMsg } from "../../components/Toast";
import Notify from "../../components/Notify";
import ConnectWallet from "../../components/ConnectWallet";
import { Link } from "react-router-dom";

const Pool = () => {
  // const { account,active } = useWeb3React();
  // const dispatch = useDispatch();
  const web3 = useSelector((state) => state.localReducer.web3State);
  const balanceEth = useSelector((state) => state.localReducer.balanceEth);
  // const web3context = useWeb3React();


  // useEffect(async () => {
  //   if (!web3context.account) {
  //     ToastMsg("warning", "Please connect your wallet first!");
  //     dispatch(Web3InitAction(web3context));
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("Web3 const", web3);
  // }, [web3]);

  // console.log("account in pool", account);
  return (
    <div>
      <div className="container-div">
        <div className="gradient-div">
          <p className="connect-wallet-txt">
            Connect your wallet to provide liquidity <br /> and start earning
            PHNX tokens
          </p>
          <img src={handsImg} className="img-hands" />
        </div>
        <p>{balanceEth}</p>
        <div className="container-div2">
          <div className="connect-wallet-div">
            <p className="phnx-heading">PhoenixDAO LP Staking</p>
            <p className="phnx-subheading">
              Stake ETH/PHNX LP Tokens and earn <br />
              rewards in PHNX
            </p>

            {account && active ? (
              <Link to='/liquidity' style={{textDecoration:'none'}}>
                <Button
                  variant="contained"
                  size="large"
                  // fullWidth={true}
                  style={{
                    ...styles.btnCollectWallet,
                    // backgroundColor: loading ? "#eee" : "#413AE2",
                  }}
                  // disabled={loading}
                  // onClick={_handleSupply}
                >
                  Get PHNX/ETH LP Token
                </Button>
              </Link>
            ) : (
              <ConnectWallet landingScreenBtn={true}/>
            )}
          </div>

          <img className="img-landing-logo" src={landingImg} />
        </div>
      </div>
    </div>
  );
};

export default Pool;

const styles = {
  btnCollectWallet: {
    backgroundColor: "#413AE2",
    marginTop: 10,
    fontSize: 12,
  },
};
