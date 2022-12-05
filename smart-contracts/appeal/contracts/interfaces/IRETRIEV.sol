// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRETRIEV is IERC165 {
    function createAppeal(uint256 deal_index) external payable;
    function returnAppealFee(uint256 deal_index)
        external
        view
        returns (uint256);
}
