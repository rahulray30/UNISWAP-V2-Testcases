pragma solidity >=0.8.7;
//SPDX-License-Identifier: UNLICENSED

interface IUniswapV2Migrator {
    function migrate(address token, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external;
}
