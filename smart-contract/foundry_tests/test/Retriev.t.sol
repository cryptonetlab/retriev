// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import "../../contracts/DataRetrievability.sol";

contract RetrievTest is Test {
    DataRetrievability retriev;

    function setUp() public {
        retriev = new DataRetrievability(address(this));
    }

    // SETUP NETWORK
    function testAddProvider() public {
        retriev.setProviderStatus(
            0x2489c48090523f37028f1e42454b7DD04943d0Bf,
            true,
            "http://localhost:8000"
        );
        assertEq(
            retriev.isProvider(0x2489c48090523f37028f1e42454b7DD04943d0Bf),
            true
        );
    }

    function testAddReferees() public {
        retriev.setRefereeStatus(
            0x9E613de85626b5f0f261C14Cb715F54c4C37D6C6,
            true,
            "http://localhost:7000"
        );
        retriev.setRefereeStatus(
            0x6c3B6e30b19275B68C83cC963951883AB7B2290A,
            true,
            "http://localhost:7001"
        );
        retriev.setRefereeStatus(
            0x333766a11BC9A83A2bfa5a0A076a91ECb61B9a11,
            true,
            "http://localhost:7002"
        );
    }

    // CREATE DEAL PROPOSAL
    function testCreateDealProposal() public {
        retriev.setProviderStatus(
            0x2489c48090523f37028f1e42454b7DD04943d0Bf,
            true,
            "http://localhost:8000"
        );
        assertEq(
            retriev.isProvider(0x2489c48090523f37028f1e42454b7DD04943d0Bf),
            true
        );
        uint256 duration = retriev.min_duration();
        uint256 collateral = 1 wei;
        address[] memory providers = new address[](1);
        providers[0] = 0x2489c48090523f37028f1e42454b7DD04943d0Bf;
        retriev.createDealProposal{value: 1 wei}(
            "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            duration,
            collateral,
            providers
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
        // Setting provide
        retriev.setProviderStatus(provider, true, "http://localhost:8000");
        assertEq(retriev.isProvider(provider), true);
        uint256 duration = retriev.min_duration();
        // Defining deal
        uint256 collateral = 1 wei;
        address[] memory providers = new address[](1);
        providers[0] = provider;
        // Start making calls with client's key
        vm.startPrank(client);
        retriev.createDealProposal{value: 1 wei}(
            "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            duration,
            collateral,
            providers
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
