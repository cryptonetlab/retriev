// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRENDER is IERC165 {
    struct Deal {
        // subject of the deal
        string deal_uri;
        // Timestamp request
        uint256 timestamp_request;
        // Starting timestamp
        uint256 timestamp_start;
        // Duration of deal expressed in seconds
        uint256 duration;
        // Amount in wei paid for the deal
        uint256 value;
        // Amount in wei needed to accept the deal
        uint256 collateral;
        // Address of provider
        mapping(address => bool) providers;
        // Address of owner
        address owner;
        // Describe if deal is canceled or not
        bool canceled;
    }

    function render(
        uint256 deal_index,
        string memory deal_uri,
        uint256 value,
        uint256 timestamp_start,
        uint256 duration,
        bool canceled
    ) external pure returns (string memory);
}
