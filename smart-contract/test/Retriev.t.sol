// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import "../contracts/Retriev.sol";

contract RetrievTest is Test {
    Retriev retriev;

    function setUp() public {
        retriev = new Retriev(address(this));
    }

    // SETUP NETWORK
    function testAddProvider() public {
        address provider = vm.addr(5);
        retriev.setProviderStatus(
            provider,
            true,
            "http://localhost:8000"
        );
        assertEq(
            retriev.isProvider(provider),
            true
        );
    }

    function testAddReferees() public {
        address referee1 = vm.addr(6);
        address referee2 = vm.addr(7);
        address referee3 = vm.addr(8);
        retriev.setRefereeStatus(
            referee1,
            true,
            "http://localhost:7000"
        );
        retriev.setRefereeStatus(
            referee2,
            true,
            "http://localhost:7001"
        );
        retriev.setRefereeStatus(
            referee3,
            true,
            "http://localhost:7002"
        );
    }

    // CREATE DEAL PROPOSAL
    function testCreateDealProposal() public {
        address provider = vm.addr(5);
        address client = vm.addr(2);
        retriev.setProviderStatus(
            provider,
            true,
            "http://localhost:8000"
        );
        assertEq(
            retriev.isProvider(provider),
            true
        );
        // Be sure contract is not protected
        retriev.tuneProtocolVariables(2, address(0), false);
        assertEq(
            retriev.contract_protected(),
            false
        );
        uint256 duration = retriev.min_duration();
        uint256 collateral = 1 wei;
        address[] memory providers = new address[](1);
        providers[0] = provider;
        // Defining appeal addresses
        address[] memory appeal_addresses = new address[](1);
        appeal_addresses[0] = client;
        retriev.createDealProposal{value: 1 wei}(
            "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            duration,
            collateral,
            providers,
            appeal_addresses
        );
    }

    // ACCEPT DEAL PROPOSAL
    function testCreateDealProposalAndAccept() public {
        // Deriving new provider from vm.addr function
        address client = vm.addr(2);
        address provider = vm.addr(5);
        // Funding client's address
        vm.deal(client, 100 ether);
        vm.deal(provider, 100 ether);
        // Be sure contract is not protected
        retriev.tuneProtocolVariables(2, address(0), false);
        assertEq(
            retriev.contract_protected(),
            false
        );
        // Setting provider
        retriev.setProviderStatus(provider, true, "http://localhost:8000");
        assertEq(retriev.isProvider(provider), true);
        uint256 duration = retriev.min_duration();
        // Defining deal
        uint256 collateral = 1 wei;
        address[] memory providers = new address[](1);
        providers[0] = provider;
        // Defining appeal addresses
        address[] memory appeal_addresses = new address[](1);
        appeal_addresses[0] = client;
        // Start making calls with client's key
        vm.startPrank(client);
        retriev.createDealProposal{value: 1 wei}(
            "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            duration,
            collateral,
            providers,
            appeal_addresses
        );
        vm.stopPrank();
        // Start making calls with provider's key
        vm.startPrank(provider);
        // Deposit to contract
        retriev.depositToVault{value: 1 ether}();
        // Finally accept the deal
        retriev.acceptDealProposal(1);
        emit log_uint(retriev.balanceOf(provider));
    }
}