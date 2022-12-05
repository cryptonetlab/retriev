// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRETRIEV.sol";

/**
 * @title RetrievAppeal
 * Contract that allows anyone appeal a deal in
 * Retriev protocol (retriev.org)
 */
contract RetrievAppeal is Ownable {
    address public _retriev;

    constructor(address retriev) {
        require(retriev != address(0), "Can't init with 0 address");
        _retriev = retriev;
    }

    function createAppeal(uint256 deal_index) public payable {
        IRETRIEV retriev = IRETRIEV(_retriev);
        require(
            msg.value == retriev.returnAppealFee(deal_index),
            "Value doesn't matches, transaction will fail"
        );
        retriev.createAppeal{value: msg.value}(deal_index);
    }
}
