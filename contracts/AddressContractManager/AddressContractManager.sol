// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AddressContract} from "../AddressContract/AddressContract.sol";
import {IPool} from "../interfaces/IPool.sol";


contract AddressContractManager is ERC721 {
    address public relay;
    IPool  public aavePool;

    // nftTokenId => AC address
    mapping(uint256 => address) public  nftAc;
    event contractCreated(address ac,uint256 id);
    constructor(address _relay, IPool _pool,string memory name_, string memory symbol_)ERC721(name_,symbol_){
        relay = _relay;
        aavePool = _pool;
    }

    modifier onlyRelay() {
        require(msg.sender == relay, "Unauthorized access:Only Relay Can Call");
        _;
    }



    function setupAC(uint256 _id) external onlyRelay {
        if (nftAc[_id] == address(0)) {
            //deploy address contract
            AddressContract ac = new AddressContract(relay, address(aavePool));

            //mint the nft
            _mint(relay, _id);

            //set the new contract address to nft
            nftAc[_id] = address(ac);
            emit contractCreated(address(ac),_id);
        }

    }

    function deposit(uint256 _id, address _token, uint _amount) external onlyRelay {
        address ac = _validateAction(_id);
        IERC20(_token).transferFrom(relay, ac, _amount);
        AddressContract(ac).deposit(_token, _amount);
    }

    function _validateAction(uint _id) internal view returns (address){
        require(ownerOf(_id) == relay, "Invalid nft owner");
        return nftAc[_id];
    }

    function borrow(uint256 _id, address _token, uint256 _amount, uint256 _rateMode) external onlyRelay {
        address ac = _validateAction(_id);
        AddressContract(ac).borrow(_token, _amount, _rateMode);
    }

    function withdraw(uint256 _id,address _token,uint256 _amount) external onlyRelay {
        address ac = _validateAction(_id);
        AddressContract(ac).withdraw(_token,_amount);
        (uint256 totalCollateral,,,,,) = aavePool.getUserAccountData(ac);
        if (totalCollateral == 0) {
            AddressContract(ac).destroy(payable(relay));
        }
    }

    function repay(uint _id, address _token, uint256 _amount, uint256 _rateMode) external onlyRelay {
        address ac = _validateAction(_id);
        IERC20(_token).transferFrom(relay, ac, _amount);
        AddressContract(ac).repay(_token, _amount, _rateMode);
    }


}
