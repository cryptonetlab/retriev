// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./libs/ERC721.sol";
import "./functions/render/IRENDER.sol";

/**
 * @title Retrieval Pinning Protocol
 */
contract RetrievalPinning is ERC721, Ownable, ReentrancyGuard {
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
        // subject of the deal
        string data_uri;
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
        // Addresses authorized to create appeals
        mapping(address => bool) appeal_addresses;
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
        // Block timestamp of deal creation
        uint256 request_timestamp;
        // Adding block timestamp to calculate timeout
        uint256 origin_timestamp;
    }

    // Render contract
    IRENDER private token_render;
    // Mapping admin roles
    mapping(uint8 => mapping(address => bool)) public admins;
    // Mapping referees addresses
    mapping(address => Referee) public referees;
    // Mapping referees providers
    mapping(address => Provider) public providers;
    // Mapping deals
    mapping(uint256 => Deal) public deals;
    // Mapping appeals
    mapping(uint256 => Appeal) public appeals;
    // Mapping pending appeals using data_uri as index
    mapping(string => uint256) public pending_appeals;
    // Mapping active appeals using data_uri as index
    mapping(string => uint256) public active_appeals;
    // Mapping all appeals using deal_index as index
    mapping(uint256 => uint8) public tot_appeals;
    // Referee, Providers and Clients vault
    mapping(address => uint256) public vault;
    // Array of active referees
    address[] public active_referees;
    // Array of active providers
    address[] public active_providers;
    // Protocol address
    address protocol_address;
    // Multipliers
    uint256 public slashing_multiplier = 1000;
    uint8 public committee_divider = 4;
    // Deal parameters
    uint32 public proposal_timeout = 86_400;
    uint8 public max_appeals = 5;
    uint256 public min_deal_value = 0;
    // Internal counters for deals and appeals mapping
    Counters.Counter private dealCounter;
    Counters.Counter private appealCounter;
    // Round parameters
    uint32 public round_duration = 300;
    uint32 public min_duration = 86_400;
    uint32 public max_duration = 31_536_000;
    uint8 public slashes_threshold = 12;
    uint8 public rounds_limit = 12;
    // Contract state variables
    bool public contract_protected = false;
    bool public permissioned_providers = false;
    // Event emitted when new deal is created
    event DealProposalCreated(
        uint256 index,
        address[] providers,
        string data_uri,
        address[] appeal_addresses
    );
    // Event emitted when a deal is canceled before being accepted
    event DealProposalCanceled(uint256 index);
    // Event emitted when a deal is redeemed
    event DealRedeemed(uint256 index);
    // Event emitted when new appeal is created
    event AppealCreated(uint256 index, address provider, string data_uri);
    // Event emitted when new appeal started
    event AppealStarted(uint256 index);
    // Event emitted when a slash message is recorded
    event RoundSlashed(uint256 index);
    // Event emitted when a deal is invalidated by an appeal
    event DealInvalidated(uint256 index);

    constructor(address _protocol_address) ERC721("Retriev", "RTV") {
        require(
            _protocol_address != address(0),
            "Can't init protocol with black-hole"
        );
        protocol_address = _protocol_address;
    }

    function totalSupply() public view returns (uint256) {
        return dealCounter.current();
    }

    function totalDeals() external view returns (uint256) {
        return dealCounter.current();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        Deal storage deal = deals[tokenId];
        string memory output = token_render.render(
            tokenId,
            deal.data_uri,
            deal.value,
            deal.timestamp_start,
            deal.duration,
            deal.canceled
        );
        return output;
    }

    function balanceOf(address _to_check)
        public
        view
        virtual
        override
        returns (uint256)
    {
        uint256 totalTkns = totalSupply();
        uint256 resultIndex = 0;
        uint256 tnkId;

        for (tnkId = 1; tnkId <= totalTkns; tnkId++) {
            if (ownerOf(tnkId) == _to_check) {
                resultIndex++;
            }
        }

        return resultIndex;
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
        This method will return the amount in ETH needed to create an appeal
    */
    function returnAppealFee(uint256 deal_index) public view returns (uint256) {
        uint256 fee = deals[deal_index].value / committee_divider;
        return fee;
    }

    /*
        This method will return the amount of signatures needed to close a rount
    */
    function refereeConsensusThreshold() public view returns (uint256) {
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
        uint256 appeal_duration = round_duration * rounds_limit;
        uint256 appeal_end = appeals[appeal_index].origin_timestamp +
            appeal_duration;
        if (appeal_end >= block.timestamp) {
            uint256 remaining_time = appeal_end - block.timestamp;
            uint256 remaining_rounds = remaining_time / round_duration;
            uint256 round = rounds_limit - remaining_rounds;
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
        return referees[check].active;
    }

    /*
        This method will say if address is a provider or not
    */
    function isProvider(address check) public view returns (bool) {
        return providers[check].active;
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
    ) external {
        if (permissioned_providers) {
            require(msg.sender == owner(), "Only owner can manage providers");
        } else {
            require(
                _provider == msg.sender || msg.sender == owner(),
                "You can't manage another provider's state"
            );
        }
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
        string memory _data_uri,
        uint256 duration,
        uint256 collateral,
        address[] memory _providers,
        address[] memory _appeal_addresses
    ) external payable nonReentrant {
        if (contract_protected) {
            require(
                msg.value == 0,
                "Contract is protected, can't accept value"
            );
        }
        require(
            duration >= min_duration && duration <= max_duration,
            "Duration is out allowed range"
        );
        // uint256 maximum_collateral = slashing_multiplier * msg.value;
        require(
            msg.value >= min_deal_value,
            // && collateral >= msg.value && collateral <= maximum_collateral
            "Collateral or value out of range"
        );
        require(
            _appeal_addresses.length > 0,
            "You must define one or more appeal addresses"
        );
        // Creating next id
        dealCounter.increment();
        uint256 index = dealCounter.current();
        // Creating the deal mapping
        deals[index].timestamp_request = block.timestamp;
        deals[index].owner = msg.sender;
        deals[index].data_uri = _data_uri;
        deals[index].duration = duration;
        deals[index].collateral = collateral;
        deals[index].value = msg.value;
        // Check if provided providers are active and store in struct
        for (uint256 i = 0; i < _providers.length; i++) {
            /*require(
                isProvider(_providers[i]),
                "Requested provider is not active"
            );*/
            deals[index].providers[_providers[i]] = true;
        }
        // CAdd appeal addresses to deal
        for (uint256 i = 0; i < _appeal_addresses.length; i++) {
            deals[index].appeal_addresses[_appeal_addresses[i]] = true;
        }
        // When created the amount of money is owned by sender
        vault[address(this)] += msg.value;
        // Emit event
        emit DealProposalCreated(
            index,
            _providers,
            _data_uri,
            _appeal_addresses
        );
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
            deals[deal_index].timestamp_start == 0,
            "Deal was accepted, can't cancel"
        );
        deals[deal_index].canceled = true;
        deals[deal_index].timestamp_start = 0;
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
        This method will return appeal address status in deal
    */
    function canAddressAppeal(uint256 deal_index, address appeal_address)
        external
        view
        returns (bool)
    {
        return deals[deal_index].appeal_addresses[appeal_address];
    }

    /*
        This method will allow a provider to accept a deal
    */
    function acceptDealProposal(uint256 deal_index) external nonReentrant {
        require(
            block.timestamp <
                (deals[deal_index].timestamp_request + proposal_timeout) &&
                !deals[deal_index].canceled &&
                deals[deal_index].providers[msg.sender],
            "Deal expired, canceled or not allowed to accept"
        );
        require(
            vault[msg.sender] >= deals[deal_index].collateral,
            "Can't accept because you don't have enough balance in contract"
        );
        // Mint the nft to the provider
        _mint(msg.sender, deal_index);
        // Activate contract
        deals[deal_index].timestamp_start = block.timestamp;
        // Deposit collateral to contract
        vault[msg.sender] -= deals[deal_index].collateral;
        vault[address(this)] += deals[deal_index].collateral;
    }

    /*
        This method will allow provider to withdraw funds for deal
    */
    function redeemDeal(uint256 deal_index) external nonReentrant {
        require(ownerOf(deal_index) == msg.sender, "Only provider can redeem");
        require(deals[deal_index].timestamp_start > 0, "Deal is not active");
        uint256 timeout = deals[deal_index].timestamp_start +
            deals[deal_index].duration;
        require(block.timestamp > timeout, "Deal didn't ended, can't redeem");
        require(
            pending_appeals[deals[deal_index].data_uri] == 0,
            "Found a pending appeal, can't redeem"
        );
        require(
            getRound(active_appeals[deals[deal_index].data_uri]) >= 99,
            "Found an active appeal, can't redeem"
        );

        // Move value from contract to address
        vault[address(this)] -= deals[deal_index].value;
        vault[msg.sender] += deals[deal_index].value;

        // Giving back collateral to provider
        vault[address(this)] -= deals[deal_index].collateral;
        vault[msg.sender] += deals[deal_index].collateral;
        // Close the deal
        deals[deal_index].timestamp_start = 0;
        emit DealRedeemed(deal_index);
    }

    /*
        This method will allow client to create an appeal
    */
    function createAppeal(uint256 deal_index) external payable nonReentrant {
        require(
            tot_appeals[deal_index] < max_appeals,
            "Can't create more appeals on deal"
        );
        require(deals[deal_index].timestamp_start > 0, "Deal is not active");
        require(
            block.timestamp <
                (deals[deal_index].timestamp_start +
                    deals[deal_index].duration),
            "Deal ended, can't create appeals"
        );
        require(
            deals[deal_index].appeal_addresses[msg.sender],
            "Only authorized addresses can create appeal"
        );
        // Check if there's a pending appeal request
        require(
            pending_appeals[deals[deal_index].data_uri] == 0,
            "There's a pending appeal request"
        );
        // Check if appeal exists or is expired
        require(
            active_appeals[deals[deal_index].data_uri] == 0 ||
                // Check if appeal is expired
                getRound(active_appeals[deals[deal_index].data_uri]) >= 99,
            "Appeal exists yet for provided hash"
        );
        // Be sure sent amount is exactly the appeal fee
        require(
            msg.value == returnAppealFee(deal_index),
            "Must send exact fee to create an appeal"
        );

        // Split fee to referees
        tot_appeals[deal_index]++;
        uint256 fee = msg.value / active_referees.length;
        for (uint256 i = 0; i < active_referees.length; i++) {
            vault[active_referees[i]] += fee;
        }
        // Creating next id
        appealCounter.increment();
        uint256 index = appealCounter.current();
        // Storing appeal status
        pending_appeals[deals[deal_index].data_uri] = index;
        // Creating appeal
        appeals[index].deal_index = deal_index;
        appeals[index].active = true;
        appeals[index].request_timestamp = block.timestamp;
        // Emit appeal created event
        emit AppealCreated(
            index,
            ownerOf(deal_index),
            deals[deal_index].data_uri
        );
    }

    /*
        This method will allow referees to start an appeal
    */
    function startAppeal(uint256 appeal_index) external {
        require(
            appeals[appeal_index].origin_timestamp == 0,
            "Appeal started yet"
        );
        require(referees[msg.sender].active, "Only referees can start appeals");
        appeals[appeal_index].origin_timestamp = block.timestamp;
        // Reset pending appeal state
        pending_appeals[deals[appeals[appeal_index].deal_index].data_uri] = 0;
        // Set active appeal state
        active_appeals[
            deals[appeals[appeal_index].deal_index].data_uri
        ] = appeal_index;
        // Emit appeal created event
        emit AppealStarted(appeal_index);
    }

    /*
        This method will allow referees to process an appeal
    */
    function processAppeal(
        uint256 deal_index,
        address[] memory _referees,
        bytes[] memory _signatures
    ) external {
        uint256 appeal_index = active_appeals[deals[deal_index].data_uri];
        uint256 round = getRound(appeal_index);
        require(deals[deal_index].timestamp_start > 0, "Deal is not active");
        require(appeals[appeal_index].active, "Appeal is not active");
        require(
            referees[msg.sender].active,
            "Only referees can process appeals"
        );
        require(
            round <= rounds_limit,
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
        emit RoundSlashed(appeal_index);
        if (appeals[appeal_index].slashes >= slashes_threshold) {
            deals[deal_index].timestamp_start = 0;
            appeals[appeal_index].active = false;
            // Return value of deal back to owner
            vault[address(this)] -= deals[deal_index].value;
            vault[deals[deal_index].owner] += deals[deal_index].value;
            // Remove funds from provider and charge provider
            uint256 collateral = deals[deal_index].collateral;
            vault[address(this)] -= collateral;
            // All collateral to protocol's address:
            vault[protocol_address] += collateral;
            // Split collateral between client and protocol:
            // -> vault[protocol_address] += collateral / 2;
            // -> vault[deals[deal_index].owner] += collateral / 2;
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
        vault[msg.sender] -= amount;
        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw to user failed");
    }

    /*
        Admin function to setup roles
    */

    function setRole(
        uint8 kind,
        bool status,
        address admin
    ) external onlyOwner {
        // Set specified role, using:
        // 1 - Protocol managers
        // 2 - Referees managers
        // 3 - Providers managers
        admins[kind][admin] = status;
    }

    /*
        Admin functions to fine tune protocol
    */
    function tuneRefereesVariables(
        uint8 kind,
        uint256 value256,
        uint8 value8,
        uint32 value32
    ) external {
        require(
            msg.sender == owner() || admins[2][msg.sender],
            "Can't manage referees variables"
        );
        if (kind == 0) {
            committee_divider = value8;
        } else if (kind == 1) {
            max_appeals = value8;
        } else if (kind == 2) {
            round_duration = value32;
        } else if (kind == 3) {
            rounds_limit = value8;
        } else if (kind == 4) {
            slashes_threshold = value8;
        }
    }

    function tuneProvidersVariables(
        uint8 kind,
        uint256 value256,
        uint8 value8,
        uint32 value32
    ) external {
        require(
            msg.sender == owner() || admins[3][msg.sender],
            "Can't manage providers variables"
        );
        if (kind == 0) {
            proposal_timeout = value32;
        } else if (kind == 1) {
            min_deal_value = value256;
        } else if (kind == 2) {
            slashing_multiplier = value256;
        } else if (kind == 3) {
            min_duration = value32;
        } else if (kind == 4) {
            max_duration = value32;
        }
    }

    function tuneProtocolVariables(
        uint8 kind,
        address addy,
        bool state
    ) external {
        require(
            msg.sender == owner() || admins[1][msg.sender],
            "Can't manage protocol variables"
        );
        if (kind == 0) {
            token_render = IRENDER(addy);
        } else if (kind == 1) {
            protocol_address = addy;
        } else if (kind == 2) {
            contract_protected = state;
        } else if (kind == 3) {
            permissioned_providers = state;
        }
    }
}
