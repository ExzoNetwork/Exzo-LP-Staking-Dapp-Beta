import React from 'react';
import { useState } from 'react';

import './switchTabs.css';
import AddLiquidity from './AddLiquidity/AddLiquidity';
import MyLiquidity from './MyLiquidity/MyLiquidity';


function SwitchTabs() {

    const [currentTab,setCurrentTab] =useState('addLiquidity');


    const ChangeTab = (tab) =>{

        if(tab==='addLiquidity'){
            setCurrentTab('addLiquidity');
        }else{
            setCurrentTab('myLiquidity');
        }

    }

    return (
        <div >
            <div className="switch-tabs-div">
                <div onClick={()=>ChangeTab('addLiquidity')} className="switch-tabs-btns" style={{background: currentTab==='addLiquidity' ? '#413AE2' : '#fff' , color: currentTab==='addLiquidity' ? '#fff' : '#73727D' }}>Add Liquidity</div>
                <div onClick={()=>ChangeTab('myLiquidity')} className="switch-tabs-btns" style={{background: currentTab==='myLiquidity' ? '#413AE2' : '#fff' , color: currentTab==='myLiquidity' ? '#fff' : '#73727D'}}>My Liquidity</div>
            </div>

            {
                currentTab==='addLiquidity' ?
                    <MyLiquidity/>
                :
                    <MyLiquidity/>

            }

        </div>
    )
}

export default SwitchTabs
