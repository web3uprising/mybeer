// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CoinRegistry is Ownable {
    struct Coin {
        address token;
        uint256 beerPrice;
        address addedBy;
    }

    Coin[] private _coins;
    mapping(address token => uint256) private _indexPlusOne;

    event CoinAdded(address indexed token, uint256 beerPrice, address indexed addedBy);
    event BeerPriceChanged(address indexed token, uint256 beerPrice);
    event CoinRemoved(address indexed token);

    error AlreadyAdded(address token);
    error NotAdded(address token);
    error NotERC20(address token);
    error ZeroPrice();
    error NotAllowed();

    constructor() Ownable(msg.sender) {}

    function addCoin(address token, uint256 beerPrice) external {
        if (beerPrice == 0) revert ZeroPrice();
        if (_indexPlusOne[token] != 0) revert AlreadyAdded(token);
        if (!implementsERC20(token)) revert NotERC20(token);
        _coins.push(Coin(token, beerPrice, msg.sender));
        _indexPlusOne[token] = _coins.length;
        emit CoinAdded(token, beerPrice, msg.sender);
    }

    function setBeerPrice(address token, uint256 beerPrice) external {
        if (beerPrice == 0) revert ZeroPrice();
        _managed(token).beerPrice = beerPrice;
        emit BeerPriceChanged(token, beerPrice);
    }

    function removeCoin(address token) external {
        _managed(token);
        uint256 index = _indexPlusOne[token] - 1;
        Coin memory last = _coins[_coins.length - 1];
        _coins[index] = last;
        _indexPlusOne[last.token] = index + 1;
        _coins.pop();
        delete _indexPlusOne[token];
        emit CoinRemoved(token);
    }

    function coins() external view returns (Coin[] memory) {
        return _coins;
    }

    function isAdded(address token) external view returns (bool) {
        return _indexPlusOne[token] != 0;
    }

    /// Calls the ERC20 views with staticcall, so a contract that lacks one returns false instead of reverting.
    function implementsERC20(address token) public view returns (bool) {
        return token.code.length > 0
            && _answers(token, abi.encodeCall(IERC20.totalSupply, ()))
            && _answers(token, abi.encodeCall(IERC20.balanceOf, (address(this))))
            && _answers(token, abi.encodeCall(IERC20.allowance, (address(this), address(this))))
            && _answers(token, abi.encodeCall(IERC20Metadata.decimals, ()))
            && _answers(token, abi.encodeCall(IERC20Metadata.symbol, ()));
    }

    function _managed(address token) private view returns (Coin storage coin) {
        uint256 indexPlusOne = _indexPlusOne[token];
        if (indexPlusOne == 0) revert NotAdded(token);
        coin = _coins[indexPlusOne - 1];
        if (msg.sender != coin.addedBy && msg.sender != owner()) revert NotAllowed();
    }

    function _answers(address token, bytes memory call) private view returns (bool) {
        (bool ok, bytes memory result) = token.staticcall(call);
        return ok && result.length >= 32;
    }
}
