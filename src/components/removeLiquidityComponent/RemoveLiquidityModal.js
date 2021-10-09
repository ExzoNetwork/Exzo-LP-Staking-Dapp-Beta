<<<<<<< HEAD
import React , {useState} from 'react';

import './removeLiquidity.css';
import Logo from'../../assets/Logo.png';
import PhnxLogo from "../../assets/PhnxLogo1.png";
import EthLogo from "../../assets/ETH1.png";



function RemoveLiquidityModal() {

  const [selectedPercentage,setSelectedPercentage] = useState(0);

  return (
    <div className='rm-liq-div'>
       <img className='rm-liq-Logo' src={Logo}></img>
      <div className='rm-liq-heading'>Remove PHNX-ETH Liquidity</div>

      <div className='rm-liq-ps-div'>

        <div className='rm-liq-ps' style={{backgroundColor: selectedPercentage===25 ? '#413AE2' : '#eee', color: selectedPercentage===25 ? '#fff' : '#000'}} onClick={()=>{setSelectedPercentage(25)}}>25%</div>
        <div className='rm-liq-ps' style={{backgroundColor: selectedPercentage===50 ? '#413AE2' : '#eee', color: selectedPercentage===50 ? '#fff' : '#000'}} onClick={()=>{setSelectedPercentage(50)}}>50%</div>
        <div className='rm-liq-ps' style={{backgroundColor: selectedPercentage===75 ? '#413AE2' : '#eee', color: selectedPercentage===75 ? '#fff' : '#000'}} onClick={()=>{setSelectedPercentage(75)}}>75%</div>
        <div className='rm-liq-ps' style={{backgroundColor: selectedPercentage===100 ? '#413AE2' : '#eee', color: selectedPercentage===100 ? '#fff' : '#000'}} onClick={()=>{setSelectedPercentage(100)}}>Max</div>

      </div>

      <div className='rm-liq-ps-input-div'>
        <input className='rm-liq-ps-input' placeholder='Enter a value'></input>
      </div>

      <div className='rm-liq-u-will-rec'>You will recieve</div>

      <div className='rm-liq-phnx-eth-det-div'>
       
        <div className='rm-liq-phnx-eth-det'>
          <img src={PhnxLogo} className='rm-liq-phnx-eth-img'></img>
          <div className='rm-liq-phnx-eth-name'>PHNX</div>
          <div className='rm-liq-phnx-eth-number'>0.653232</div>
        </div>

        {/* <div style={{h}}></div> */}

        <div className='rm-liq-phnx-eth-det'>
          <img src={EthLogo} className='rm-liq-phnx-eth-img'></img>
          <div className='rm-liq-phnx-eth-name'>ETH</div>
          <div className='rm-liq-phnx-eth-number'>0.231</div>
        </div>

      </div>

    </div>
  )
}

export default RemoveLiquidityModal
=======
import React from "react";
import "./removeLiquidity.css";
import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import RemoveLiquidityComponent from "./index";

const RemoveLiquidityModaL = () => {
  const [isVsible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div>
      <Modal
        open={isVsible}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <RemoveLiquidityComponent Close={handleClose} />
      </Modal>
    </div>
  );
};

export default RemoveLiquidityModaL;
>>>>>>> bc441d5d48df0a4140f6fdfcea942be1b39548ad
