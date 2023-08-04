pragma solidity >=0.5.0;
//SPDX-License-Identifier: UNLICENSED

interface IUniswapV1Factory {
    function getExchange(address) external view returns (address);
}
