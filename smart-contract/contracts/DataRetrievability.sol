// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Base64.sol";

/**
 * @title DataRetrievability
 */
contract DataRetrievability is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // Defining provider struct
    struct Referee {
        bool active;
        string endpoint;
    }

    // Defining provider struct
    struct Provider {
        bool active;
        string endpoint;
    }

    // Defining deal struct
    struct Deal {
        // Hash subject of the deal
        string ipfs_hash;
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
        // Store provider who accepted the deal
        address accepted;
        // Address of owner
        address owner;
        // Describe if deal is active or not
        bool active;
        // Describe if deal is canceled or not
        bool canceled;
    }

    // Defining appeal struct
    struct Appeal {
        // Index object of the deal
        uint256 deal_index;
        // Describe if appeal is active or not
        bool active;
        // Mapping that stores what rounds were processed
        mapping(uint256 => bool) processed;
        // Counter for slashes
        uint128 slashes;
        // Adding block timestamp to calculate timeout
        uint256 origin_timestamp;
    }

    // Mapping referees addresses
    mapping(address => Referee) public referees;
    // Mapping referees providers
    mapping(address => Provider) public providers;
    // Mapping deals
    mapping(uint256 => Deal) public deals;
    // Mapping appeals
    mapping(uint256 => Appeal) public appeals;
    // Mapping active appeals using IPFS hash as index
    mapping(string => uint256) public active_appeals;
    // Referee, Providers and Clients vault
    mapping(address => uint256) public vault;
    // Array of active referees
    address[] public active_referees;
    // Array of active providers
    address[] public active_providers;
    // Protocol address
    address protocol_address;
    // Multipliers
    uint256 public deposit_multiplier = 100;
    uint256 public slashing_multiplier = 10;
    // Timeout to accept a deal (1 week)
    uint32 public deal_timeout = 86_400;
    // Internal counters for deals and appeals mapping
    Counters.Counter private dealCounter;
    Counters.Counter private appealCounter;
    // Round parameters
    uint32 public round_duration = 300;
    uint32 public min_duration = 3600;
    uint32 public max_duration = 43_200;
    uint8 public slashes_threshold = 12;
    uint8 public rounds_limit = 12;
    // NFT variables
    mapping(uint256 => uint256) public nft_to_deal;
    Counters.Counter private nftCounter;
    // Event emitted when new deal is created
    event DealProposalCreated(
        uint256 index,
        address[] providers,
        string ipfs_hash
    );
    // Event emitted when a deal is accepted
    event DealProposalAccepted(uint256 index);
    // Event emitted when a deal is rejected
    event DealRejected(uint256 index);
    // Event emitted when a deal is canceled before end
    event DealProposalCanceled(uint256 index);
    // Event emitted when a deal is redeemed
    event DealRedeemed(uint256 index);
    // Event emitted when a deal is invalidated
    event DealInvalidated(uint256 index);
    // Event emitted when new appeal is created
    event AppealCreated(uint256 index, address provider, string ipfs_hash);
    // Event emitted when a slash message is recorded
    event AppealSlashed(uint256 index);

    constructor(address _protocol_address) ERC721("Retriev", "RTV") {
        protocol_address = _protocol_address;
    }

    function totalSupply() public view returns (uint256) {
        return nftCounter.current();
    }

    function totalDeals() public view returns (uint256) {
        return dealCounter.current();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string[12] memory parts;
        Deal storage deal = deals[nft_to_deal[tokenId]];
        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 500 500"><style>.base { fill: #fff; font-family: monospace; font-size: 14px; }</style><rect width="100%" height="100%" fill="#000" />';
        // TODO: Add logo here
        parts[1] = '<text x="10" y="410" class="base">CID: ';
        parts[2] = deal.ipfs_hash;
        parts[3] = '</text><text x="10" y="430" class="base">VALUE WEI:';
        parts[4] = Strings.toString(deal.value);
        parts[5] = '</text><text x="10" y="450" class="base">STARTED AT:';
        parts[6] = Strings.toString(deal.timestamp_start);
        parts[7] = '</text><text x="10" y="470" class="base">DURATION:';
        parts[8] = Strings.toString(deal.duration);
        parts[9] = '</text><text x="10" y="490" class="base">STATUS:';
        if (deal.active) {
            parts[10] = "ACTIVE";
        } else {
            parts[10] = "NOT ACTIVE";
        }
        parts[11] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6],
                parts[7]
            )
        );
        output = string(
            abi.encodePacked(output, parts[8], parts[9], parts[10], parts[11])
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "DEAL #',
                        Strings.toString(nft_to_deal[tokenId]),
                        '", "description": "Retriev deal token", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    /*
        This method verifies a signature
    */
    function verifyRefereeSignature(
        bytes memory _signature,
        uint256 deal_index,
        address referee
    ) public view returns (bool) {
        require(referees[referee].active, "Provided address is not a referee");
        bytes memory message = getPrefix(deal_index);
        bytes32 hashed = ECDSA.toEthSignedMessageHash(message);
        address recovered = ECDSA.recover(hashed, _signature);
        return recovered == referee;
    }

    /*
        This method returns the prefix for
    */
    function getPrefix(uint256 appeal_index)
        public
        view
        returns (bytes memory)
    {
        uint256 deal_index = appeals[appeal_index].deal_index;
        uint256 round = getRound(appeal_index);
        return
            abi.encodePacked(
                Strings.toString(deal_index),
                Strings.toString(appeal_index),
                Strings.toString(round)
            );
    }

    /*
        This method will return the amount of slashes needed to close the appeal
    */
    function returnSlashesThreshold() public view returns (uint8) {
        return slashes_threshold;
    }

    /*
        This method will return the amount of rounds needed to positive timeout
    */
    function returnRoundsLimit() public view returns (uint8) {
        return rounds_limit;
    }

    /*
        This method will return the amount in ETH needed to create an appeal
    */
    function returnAppealFee(uint256 deal_index) public view returns (uint256) {
        // QUESTION: How we calculate the amount needed?
        uint256 fee = deals[deal_index].value * 2;
        return fee;
    }

    /*
        This method will return the amount of signatures needed to close a rount
    */
    function refereeConsensusThreshold() public view returns (uint256) {
        // QUESTION: Provide the exact way to count the number for consensus
        uint256 half = (active_referees.length * 100) / 2;
        return half;
    }

    /*
        This method will return the leader for a provided appeal
    */
    function getElectedLeader(uint256 appeal_index)
        public
        view
        returns (address)
    {
        uint256 round = getRound(appeal_index);
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    appeals[appeal_index].origin_timestamp +
                        appeal_index +
                        round
                )
            )
        );
        uint256 leader = (seed -
            ((seed / active_referees.length) * active_referees.length));
        return active_referees[leader];
    }

    /*
        This method will return the round for provided appeal
    */
    function getRound(uint256 appeal_index) public view returns (uint256) {
        uint256 appeal_duration = round_duration * returnRoundsLimit();
        uint256 appeal_end = appeals[appeal_index].origin_timestamp +
            appeal_duration;
        if (appeal_end >= block.timestamp) {
            uint256 remaining_time = appeal_end - block.timestamp;
            uint256 remaining_rounds = remaining_time / round_duration;
            uint256 round = returnRoundsLimit() - remaining_rounds;
            return round;
        } else {
            // Means appeal is ended
            return 99;
        }
    }

    /*
        This method will say if address is a referee or not
    */
    function isReferee(address check) public view returns (bool) {
        // This may change if we use NFTs
        return referees[check].active == true;
    }

    /*
        This method will say if address is a provider or not
    */
    function isProvider(address check) public view returns (bool) {
        // This may change if we use NFT
        // QUESTION: Should we check here if there's enough balance?
        return providers[check].active == true;
    }

    /*
        This method will allow owner to enable or disable a referee
    */
    function setRefereeStatus(
        address _referee,
        bool _state,
        string memory _endpoint
    ) external onlyOwner {
        referees[_referee].active = _state;
        referees[_referee].endpoint = _endpoint;
        if (_state) {
            active_referees.push(_referee);
        } else {
            for (uint256 i = 0; i < active_referees.length; i++) {
                if (active_referees[i] == _referee) {
                    delete active_referees[i];
                }
            }
        }
    }

    /*
        This method will allow owner to enable or disable a provider
    */
    function setProviderStatus(
        address _provider,
        bool _state,
        string memory _endpoint
    ) external onlyOwner {
        providers[_provider].active = _state;
        providers[_provider].endpoint = _endpoint;
        if (_state) {
            active_providers.push(_provider);
        } else {
            for (uint256 i = 0; i < active_providers.length; i++) {
                if (active_providers[i] == _provider) {
                    delete active_providers[i];
                }
            }
        }
    }

    /*
        This method will allow client to create a deal
    */
    function createDealProposal(
        string memory _ipfs_hash,
        uint256 duration,
        uint256 collateral,
        address[] memory _providers
    ) external payable nonReentrant {
        require(
            duration >= min_duration && duration <= max_duration,
            "Duration is out allowed range"
        );
        uint256 maximum_collateral = slashing_multiplier * msg.value;
        require(
            collateral >= msg.value && collateral <= maximum_collateral,
            "Collateral out of range"
        );
        // Creating next id
        dealCounter.increment();
        uint256 index = dealCounter.current();
        // Creating the deal mapping
        deals[index].timestamp_request = block.timestamp;
        deals[index].owner = msg.sender;
        deals[index].active = true;
        deals[index].ipfs_hash = _ipfs_hash;
        deals[index].duration = duration;
        deals[index].collateral = collateral;
        deals[index].value = msg.value;
        // Check if provided providers are active and store in struct
        for (uint256 i = 0; i < _providers.length; i++) {
            require(
                isProvider(_providers[i]),
                "Requested provider is not active"
            );
            deals[index].providers[_providers[i]] = true;
        }
        // When created the amount of money is owned by sender
        vault[address(this)] += msg.value;
        // Create the NFT for the client
        nftCounter.increment();
        uint256 newTokenId = nftCounter.current();
        nft_to_deal[newTokenId] = index;
        _mint(msg.sender, newTokenId);
        // Emit event
        emit DealProposalCreated(index, _providers, _ipfs_hash);
    }

    /*
        This method will allow client to cancel deal if not accepted
    */
    function cancelDealProposal(uint256 deal_index) external nonReentrant {
        require(
            deals[deal_index].owner == msg.sender,
            "Only owner can cancel the deal"
        );
        require(!deals[deal_index].canceled, "Deal canceled yet");
        require(
            deals[deal_index].accepted == address(0),
            "Deal was accepted, can't cancel"
        );
        deals[deal_index].canceled = true;
        deals[deal_index].active = false;
        // Remove funds from internal vault giving back to user
        // user will be able to withdraw funds later
        vault[address(this)] -= deals[deal_index].value;
        vault[msg.sender] += deals[deal_index].value;
        emit DealProposalCanceled(deal_index);
    }

    /*
        This method will return provider status in deal
    */
    function isProviderInDeal(uint256 deal_index, address provider)
        external
        view
        returns (bool)
    {
        return deals[deal_index].providers[provider];
    }

    /*
        This method will allow a provider to accept a deal
    */
    function acceptDealProposal(uint256 deal_index) external nonReentrant {
        uint256 timeout = deals[deal_index].timestamp_request + deal_timeout;
        require(
            block.timestamp < timeout,
            "Deal expired, can't accept anymore"
        );
        require(
            deals[deal_index].providers[msg.sender],
            "Only selected providers can accept deal"
        );
        require(
            deals[deal_index].accepted == address(0),
            "Deal proposal was accepted yet"
        );
        uint256 deposit_margin = deals[deal_index].value * deposit_multiplier;
        require(
            vault[msg.sender] >= deals[deal_index].collateral &&
                vault[msg.sender] >= deposit_margin,
            "Can't accept because you don't have enough balance in contract"
        );
        deals[deal_index].active = true;
        deals[deal_index].accepted = msg.sender;
        deals[deal_index].timestamp_start = block.timestamp;
        // Deposit collateral to contract
        vault[msg.sender] -= deals[deal_index].collateral;
        vault[address(this)] += deals[deal_index].collateral;
        // Create the NFT for the client
        nftCounter.increment();
        uint256 newTokenId = nftCounter.current();
        nft_to_deal[newTokenId] = deal_index;
        _mint(msg.sender, newTokenId);
        emit DealProposalAccepted(deal_index);
    }

    /*
        This method will allow provider to withdraw funds for deal
    */
    function redeemDeal(uint256 deal_index) external nonReentrant {
        require(
            deals[deal_index].accepted == msg.sender,
            "Only provider can redeem"
        );
        require(deals[deal_index].active, "Deal is not active");
        uint256 timeout = deals[deal_index].timestamp_start +
            deals[deal_index].duration;
        require(block.timestamp > timeout, "Deal didn't ended, can't redeem");
        require(
            getRound(active_appeals[deals[deal_index].ipfs_hash]) == 99,
            "Found an active appeal, can't redeem"
        );
        // QUESTION: How we detect the amount of value sent to provider
        // do it with parameters counting the total appeals and setting
        // a threshold to do remove the value.

        // Move value from contract to address
        vault[address(this)] -= deals[deal_index].value;
        vault[msg.sender] += deals[deal_index].value;

        // Giving back collateral to provider
        vault[address(this)] -= deals[deal_index].collateral;
        vault[msg.sender] += deals[deal_index].collateral;
        // Close the deal
        deals[deal_index].active = false;
        emit DealRedeemed(deal_index);
    }

    /*
        This method will allow referees to create an appeal
    */
    function createAppeal(uint256 deal_index) external payable nonReentrant {
        require(deals[deal_index].active, "Deal is not active");
        uint256 timeout = deals[deal_index].timestamp_start +
            deals[deal_index].duration;
        require(block.timestamp < timeout, "Deal ended, can't create appeals");
        require(
            deals[deal_index].owner == msg.sender,
            "Only owner can create appeal"
        );
        // Check if appeal exists or is expired
        require(
            active_appeals[deals[deal_index].ipfs_hash] == 0 ||
                // Check if appeal is expired
                getRound(active_appeals[deals[deal_index].ipfs_hash]) == 99,
            "Appeal exists yet for provided hash"
        );
        // Be sure sent amount is exactly the appeal fee
        require(
            msg.value == returnAppealFee(deal_index),
            "Must send exact fee to create an appeal"
        );
        // Sending fee to referees
        uint256 fee = msg.value / active_referees.length;
        for (uint256 i = 0; i < active_referees.length; i++) {
            vault[active_referees[i]] += fee;
        }
        // Creating next id
        appealCounter.increment();
        uint256 index = appealCounter.current();
        // Storing appeal status
        active_appeals[deals[deal_index].ipfs_hash] = index;
        // Creating appeal
        appeals[index].deal_index = deal_index;
        appeals[index].active = true;
        appeals[index].origin_timestamp = block.timestamp;
        // Emit appeal created event
        emit AppealCreated(
            index,
            deals[deal_index].accepted,
            deals[deal_index].ipfs_hash
        );
    }

    /*
        This method will allow referees to process an appeal
    */
    function processAppeal(
        uint256 deal_index,
        address[] memory _referees,
        bytes[] memory _signatures
    ) external {
        uint256 appeal_index = active_appeals[deals[deal_index].ipfs_hash];
        uint256 round = getRound(appeal_index);
        require(deals[deal_index].active, "Deal is not active");
        require(appeals[appeal_index].active, "Appeal is not active");
        require(
            referees[msg.sender].active,
            "Only referees can process appeals"
        );
        require(
            round <= returnRoundsLimit(),
            "This appeal can't be processed anymore"
        );
        require(
            !appeals[appeal_index].processed[round],
            "This round was processed yet"
        );
        appeals[appeal_index].processed[round] = true;
        bool slashed = false;
        if (getElectedLeader(appeal_index) == msg.sender) {
            appeals[appeal_index].slashes++;
            slashed = true;
        } else {
            for (uint256 i = 0; i < _referees.length; i++) {
                address referee = _referees[i];
                bytes memory signature = _signatures[i];
                // Be sure leader is not hacking the system
                require(
                    verifyRefereeSignature(signature, deal_index, referee),
                    "Signature doesn't matches"
                );
            }
            if (_signatures.length > refereeConsensusThreshold()) {
                appeals[appeal_index].slashes++;
                slashed = true;
            }
        }
        require(
            slashed,
            "Appeal wasn't slashed, not the leader or no consensus"
        );
        emit AppealSlashed(appeal_index);
        if (appeals[appeal_index].slashes >= returnSlashesThreshold()) {
            deals[deal_index].active = false;
            appeals[appeal_index].active = false;
            // Return value of deal back to owner
            vault[address(this)] -= deals[deal_index].value;
            vault[deals[deal_index].owner] += deals[deal_index].value;
            // Remove funds from provider and charge provider
            uint256 collateral = deals[deal_index].collateral;
            vault[address(this)] -= collateral;
            vault[protocol_address] += collateral;
            // vault[protocol_address] += collateral / 2;
            // vault[deals[deal_index].owner] += collateral / 2;
            // Emit event of deal invalidated
            emit DealInvalidated(deal_index);
        }
    }

    /*
        This method will allow provider deposit ETH in order to accept deals
    */
    function depositToVault() external payable nonReentrant {
        require(
            isProvider(msg.sender),
            "Only providers can deposit into contract"
        );
        require(msg.value > 0, "Must send some value");
        vault[msg.sender] += msg.value;
    }

    /*
        This method will allow to withdraw ethers from contract
    */
    function withdrawFromVault(uint256 amount) external nonReentrant {
        uint256 balance = vault[msg.sender];
        require(balance >= amount, "Not enough balance to withdraw");
        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw to user failed");
        vault[msg.sender] -= amount;
    }

    // Admin function to fine tune the protocol
    function tuneProtocol(uint8 kind, uint256 value256, uint8 value8, uint32 value32) external onlyOwner {
        if (kind == 0) {
            deposit_multiplier = value256;
        } else if (kind == 1) {
            slashing_multiplier = value256;
        } else if (kind == 2) {
            deal_timeout = value32;
        } else if (kind == 3) {
            round_duration = value32;
        } else if (kind == 4) {
            min_duration = value32;
        } else if (kind == 5) {
            max_duration = value32;
        } else if (kind == 6) {
            slashes_threshold = value8;
        } else if (kind == 7) {
            rounds_limit = value8;
        }
    }

    // TODO: Remove the possibility to transfer the tokens
}
