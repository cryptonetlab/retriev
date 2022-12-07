// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRENDER is IERC165 {
    function render(
        uint256 deal_index,
        string memory data_uri,
        uint256 value,
        uint256 timestamp_start,
        uint256 duration,
        bool appeal,
        address owner
    ) external pure returns (string memory);
}
