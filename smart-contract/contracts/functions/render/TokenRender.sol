// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TokenRender {
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
        // Describe if deal is active or not
        bool active;
        // Describe if deal is canceled or not
        bool canceled;
    }

    function contains(string memory what, string memory where)
        public
        pure
        returns (bool)
    {
        bytes memory whatBytes = bytes(what);
        bytes memory whereBytes = bytes(where);

        require(whereBytes.length >= whatBytes.length);

        bool found = false;
        for (uint256 i = 0; i <= whereBytes.length - whatBytes.length; i++) {
            bool flag = true;
            for (uint256 j = 0; j < whatBytes.length; j++)
                if (whereBytes[i + j] != whatBytes[j]) {
                    flag = false;
                    break;
                }
            if (flag) {
                found = true;
                break;
            }
        }
        return found;
    }

    function render(
        uint256 deal_index,
        string memory deal_uri,
        uint256 value,
        uint256 timestamp_start,
        uint256 duration,
        bool canceled
    ) public pure returns (string memory) {
        if (contains("ipfs://", deal_uri)) {
            string[12] memory parts;
            parts[
                0
            ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 500 500"><style>.base { fill: #fff; font-family: monospace; font-size: 14px; }</style><rect width="100%" height="100%" fill="#000" />';
            // TODO: Add logo here
            parts[1] = '<text x="10" y="410" class="base">URI: ';
            parts[2] = deal_uri;
            parts[3] = '</text><text x="10" y="430" class="base">VALUE WEI:';
            parts[4] = Strings.toString(value);
            parts[5] = '</text><text x="10" y="450" class="base">STARTED AT:';
            parts[6] = Strings.toString(timestamp_start);
            parts[7] = '</text><text x="10" y="470" class="base">DURATION:';
            parts[8] = Strings.toString(duration);
            parts[9] = '</text><text x="10" y="490" class="base">STATUS:';
            // TODO: Check if active is needed or not
            if (timestamp_start > 0) {
                parts[10] = "ACTIVE";
            } else if (canceled == false) {
                parts[10] = "CANCELED";
            } else {
                parts[10] = "N/A";
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
                abi.encodePacked(
                    output,
                    parts[8],
                    parts[9],
                    parts[10],
                    parts[11]
                )
            );

            string memory json = Base64.encode(
                bytes(
                    string(
                        abi.encodePacked(
                            '{"name": "DEAL #',
                            Strings.toString(deal_index),
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
        } else {
            return "";
        }
    }
}
