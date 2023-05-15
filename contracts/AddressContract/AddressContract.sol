// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IPool} from "../interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AddressContract {
    address relay;
    address acManager;
    IPool aave;


    constructor(address _relay, address _pool){
        relay = _relay;
        acManager = msg.sender;
        aave = IPool(_pool);

    }

    modifier onlyRelay() {
        require(msg.sender == relay, "Airdrop Supply is paused");
        _;
    }

    modifier onlyACM() {
        require(msg.sender == acManager, "Airdrop Supply is paused");
        _;
    }

    function deposit(address _token, uint _amount) external onlyACM {
        IERC20(_token).approve(address(aave), _amount);
        aave.supply(_token, _amount, address(this), 0);
    }

    function borrow(address _token,uint _amount,uint256 _rateMode) external onlyACM {
        aave.borrow(_token,_amount,_rateMode,0,address(this));
        IERC20(_token).transfer(relay,_amount);
    }

    function withdraw(address _token,uint _amount) external onlyACM {
        aave.withdraw(_token,_amount,address(this));
        IERC20(_token).transfer(relay,_amount);

    }

    function repay(address _token,uint _amount,uint _rateMode) external onlyACM {
        IERC20(_token).approve(address(aave), _amount);
        aave.repay(_token,_amount,_rateMode,address(this));

    }

    function destroy(address payable addr) external onlyACM{
        selfdestruct(addr);
    }


}
