// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TokenRender {
    mapping(uint8 => string) public backgrounds;

    // Tools
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

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    // Base of the NFT
    function base(string memory _color) internal pure returns (string memory) {
        string[3] memory parts;
        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" width="1073" height="1073" fill="none"><g clip-path="url(#B)"><style>.status{fill: #000; font-family:monospace;font-size:35px;}.base{font-family:monospace;font-size: 28px;}</style><path fill="#2d2c2c" d="M1073 1073V0H0v1073z"/><path transform="matrix(0 -1 -1 0 1085 1110)" fill="url(#A)" d="M0 0h1600v1092H0z"/><g fill="#fff"><path d="M86.501 421.753v-1.692H76.156v-8.814h11.859v-1.708H74.239V433H88.08v-1.692H76.156v-9.555h10.345zm15.114-2.208l-5.914-10.006h-2.256l7.074 11.553L93.22 433h2.256l6.172-10.345 6.17 10.345h2.24l-7.299-11.908 7.073-11.553h-2.272l-5.945 10.006zm15.758 3.787h5.462c1.021-.011 1.977-.172 2.868-.483.903-.312 1.687-.763 2.353-1.354.677-.58 1.208-1.289 1.595-2.127.387-.848.58-1.81.58-2.884 0-1.085-.193-2.052-.58-2.901s-.913-1.568-1.579-2.159-1.45-1.047-2.353-1.369-1.863-.494-2.884-.516h-7.38V433h1.918v-9.668zm0-1.644v-10.489h5.462c.774.01 1.493.145 2.159.403.677.247 1.263.601 1.757 1.063.483.462.864 1.021 1.144 1.676.279.644.419 1.369.419 2.175s-.145 1.526-.435 2.159c-.28.623-.666 1.155-1.161 1.596-.494.451-1.074.8-1.74 1.047-.666.236-1.38.36-2.143.37h-5.462zm18.175-12.149v1.74h5.704v19.997h-5.704V433h13.583v-1.724h-5.881v-19.997h5.881v-1.74h-13.583zm28.359 13.648l5.14 9.813h2.014v-.209l-5.366-10.055a9.74 9.74 0 0 0 1.869-1.015c.57-.398 1.058-.854 1.467-1.37a6.16 6.16 0 0 0 .95-1.756c.237-.645.355-1.365.355-2.159 0-1.096-.199-2.063-.596-2.901-.387-.848-.919-1.568-1.596-2.159-.687-.58-1.487-1.026-2.4-1.337s-1.886-.478-2.917-.5h-6.623V433h1.902v-9.813h5.801zm-5.801-1.644v-10.344h4.721c.784.01 1.515.134 2.191.37.688.237 1.279.575 1.773 1.015.505.452.897.999 1.176 1.644.29.645.435 1.375.435 2.191 0 .752-.134 1.44-.403 2.063-.257.612-.617 1.144-1.079 1.595-.473.451-1.026.806-1.66 1.064a5.93 5.93 0 0 1-2.03.402h-5.124zm30.792.21v-1.692h-10.345v-8.814h11.859v-1.708h-13.777V433h13.842v-1.692h-11.924v-9.555h10.345zm20.93 5.478c0 .763-.161 1.424-.483 1.982-.323.548-.747.999-1.273 1.354a5.36 5.36 0 0 1-1.773.806c-.666.171-1.342.257-2.03.257-.827 0-1.601-.107-2.32-.322-.709-.225-1.338-.558-1.885-.999a5.34 5.34 0 0 1-1.37-1.611c-.344-.645-.564-1.386-.661-2.224h-1.949c.043.999.263 1.901.66 2.707a6.39 6.39 0 0 0 1.628 2.079c.762.677 1.659 1.192 2.691 1.547 1.042.343 2.11.515 3.206.515.924 0 1.837-.123 2.739-.37.903-.258 1.708-.645 2.417-1.16.709-.505 1.284-1.139 1.724-1.902.452-.763.677-1.66.677-2.691s-.22-1.928-.66-2.691c-.43-.773-.989-1.428-1.676-1.966-.72-.547-1.515-1.004-2.385-1.369a23.25 23.25 0 0 0-2.562-.951l-1.966-.66c-.687-.258-1.31-.575-1.869-.951-.569-.376-1.037-.833-1.402-1.37-.365-.548-.548-1.214-.548-1.998 0-.73.156-1.364.468-1.901a4.46 4.46 0 0 1 1.256-1.354 5.4 5.4 0 0 1 1.725-.789 7.1 7.1 0 0 1 1.949-.274c.784 0 1.499.123 2.143.37.656.247 1.22.597 1.692 1.048.484.451.87.993 1.16 1.627.29.623.478 1.316.564 2.079h1.95c-.032-1.031-.252-1.966-.661-2.804-.408-.849-.956-1.568-1.643-2.159-.677-.591-1.466-1.047-2.369-1.37-.891-.333-1.837-.499-2.836-.499a9.05 9.05 0 0 0-2.658.403 7.67 7.67 0 0 0-2.369 1.144 6.21 6.21 0 0 0-1.708 1.917c-.43.752-.645 1.617-.645 2.594.011 1.064.247 1.961.709 2.691s1.058 1.359 1.789 1.886c.666.483 1.413.897 2.24 1.24l2.417.887 2.03.709c.698.268 1.337.596 1.917.982a5.06 5.06 0 0 1 1.402 1.467c.376.569.559 1.267.548 2.094zm28.117-17.692v1.74h5.704v19.997h-5.704V433h13.583v-1.724h-5.881v-19.997h5.881v-1.74h-13.583zM272.523 433v-23.461h-1.917v19.723l-10.78-19.723h-1.902V433h1.902l.016-19.755L270.622 433h1.901zM86.709 246.878h-1.901c-.129.816-.338 1.579-.628 2.288-.279.709-.65 1.321-1.112 1.837a5.04 5.04 0 0 1-1.724 1.241c-.666.3-1.45.445-2.353.435-.763 0-1.439-.124-2.03-.371a5.19 5.19 0 0 1-1.563-1.047c-.451-.44-.833-.946-1.144-1.515a10.53 10.53 0 0 1-.741-1.837 13.77 13.77 0 0 1-.435-1.966c-.086-.676-.129-1.332-.129-1.965v-3.433a15.22 15.22 0 0 1 .129-1.949 13.54 13.54 0 0 1 .435-1.982 9.41 9.41 0 0 1 .757-1.821 5.99 5.99 0 0 1 1.144-1.515 4.9 4.9 0 0 1 1.547-1.015c.602-.258 1.278-.392 2.03-.403.902 0 1.687.156 2.353.468.666.3 1.235.714 1.708 1.24.473.537.849 1.161 1.128 1.87.29.708.499 1.466.628 2.271h1.901c-.118-1.074-.376-2.067-.773-2.98a7.48 7.48 0 0 0-1.563-2.385c-.645-.666-1.418-1.187-2.32-1.563-.902-.387-1.923-.575-3.062-.564-.934.011-1.778.161-2.53.451-.752.279-1.418.666-1.998 1.16a7.68 7.68 0 0 0-1.531 1.74c-.43.666-.784 1.381-1.063 2.143a13.91 13.91 0 0 0-.629 2.401 16.06 16.06 0 0 0-.225 2.466v3.4a16.06 16.06 0 0 0 .225 2.465 13.91 13.91 0 0 0 .629 2.385c.279.762.628 1.477 1.047 2.143a7.49 7.49 0 0 0 1.547 1.74 6.86 6.86 0 0 0 1.998 1.176c.752.29 1.595.435 2.53.435 1.117.011 2.122-.172 3.013-.548.902-.386 1.681-.918 2.336-1.595.655-.655 1.182-1.439 1.579-2.352a10.56 10.56 0 0 0 .79-2.949zm5.881-16.339v1.74h5.704v19.997H92.59V254h13.584v-1.724h-5.882v-19.997h5.882v-1.74H92.589zM112.827 254h5.656c1.02-.021 1.971-.167 2.852-.435a8.73 8.73 0 0 0 2.384-1.128c.688-.462 1.3-1.02 1.837-1.676a9.92 9.92 0 0 0 1.37-2.143 11.34 11.34 0 0 0 .838-2.465 12.69 12.69 0 0 0 .29-2.723v-2.305c-.011-.966-.118-1.89-.322-2.771-.194-.892-.473-1.724-.838-2.498a9.25 9.25 0 0 0-1.515-2.288 8.47 8.47 0 0 0-2.127-1.724c-.666-.397-1.402-.709-2.207-.934-.795-.226-1.649-.349-2.562-.371h-5.656V254zm1.917-21.801h3.739a7.85 7.85 0 0 1 1.933.258 6.54 6.54 0 0 1 1.644.644 6.33 6.33 0 0 1 1.917 1.579 8.56 8.56 0 0 1 1.305 2.143c.269.645.473 1.327.613 2.047.15.719.231 1.455.241 2.207v2.353c-.01.741-.086 1.466-.225 2.175-.129.709-.322 1.38-.58 2.014-.28.698-.639 1.338-1.08 1.918a6.89 6.89 0 0 1-1.531 1.482c-.558.408-1.192.731-1.901.967-.709.225-1.488.349-2.336.37h-3.739v-20.157z"/><rect x="60.5" y="74.5" width="244" height="81" rx="40.5" stroke="#000"/></g><g clip-path="url(#C)" fill="#';
        parts[1] = _color;
        parts[
            2
        ] = '"><path d="M659 659v333.733h142.798V935.19h-84.864V716.543h176.989l43.143 42.852v118.29H995v-137.37l-81.945-81.391L659 659z"/><path d="M801.798 877.8h135.268V993h-57.818v-57.81h-77.45V877.8z"/></g></g><defs><linearGradient id="A" x1="1122" y1="0" x2="27.692" y2="1147.59" gradientUnits="userSpaceOnUse"><stop stop-color="#';
        return string(abi.encodePacked(parts[0], parts[1], parts[2]));
    }

    // Final image rendering
    function image(
        string memory data_uri,
        uint256 timestamp_start,
        uint256 duration,
        bool appeal
    ) public view returns (string memory) {
        string memory status = "INACTIVE";
        uint256 days_left = 0;
        uint256 hours_left = 0;
        uint256 minutes_left = 0;
        uint256 seconds_left = 0;
        string[15] memory parts;

        // Defining reder array
        parts[0] = base("fff");
        parts[1] = "efefef";
        parts[2] = '"/><stop offset=".828" stop-color="#';
        parts[3] = "232323";
        // Define default positions and colors
        parts[
            4
        ] = '"/></linearGradient><clipPath id="B"><path fill="#fff" transform="matrix(0 -1 -1 0 1073 1073)" d="M0 0h1073v1073H0z"/></clipPath><clipPath id="C"><path fill="#fff" transform="translate(659 659)" d="M0 0h336v334H0z"/></clipPath></defs>';
        parts[5] = '<text fill="#ccc" x="70" y="300" class="base">';
        parts[9] = '</text><text fill="#ccc" x="70" y="480" class="base">';
        parts[12] = '<text x="95" y="127" class="status">';
        parts[7] = "...";
        parts[14] = "</text></svg>";

        // Check status
        if (
            timestamp_start > 0 &&
            (timestamp_start + duration) > block.timestamp
        ) {
            parts[0] = base("fff");
            status = "ACTIVE";
            parts[1] = "d2d2d2";
            parts[3] = "33ff94";
            parts[12] = '<text x="115" y="127" class="status">';
            parts[5] = '<text fill="#000" x="70" y="300" class="base">';
            parts[9] = '</text><text fill="#000" x="70" y="480" class="base">';
            uint256 remaining = timestamp_start + duration - block.timestamp;
            days_left = remaining / 86400;
            if (days_left == 0) {
                hours_left = remaining / 3600;
            }
            if (hours_left == 0) {
                minutes_left = remaining / 60;
            }
            if (days_left == 0 && hours_left == 0) {
                seconds_left = remaining;
            }
        }
        if (appeal) {
            parts[0] = base("fff");
            status = "APPEAL";
            parts[1] = "33ff91";
            parts[3] = "9a77ff";
        }
        // Adding status
        parts[13] = status;

        // Adding datauri
        parts[6] = substring(data_uri, 0, 15);
        parts[8] = substring(
            data_uri,
            bytes(data_uri).length - 15,
            bytes(data_uri).length
        );
        // Adding expiration
        if (days_left > 0) {
            parts[10] = Strings.toString(days_left);
            parts[11] = " DAYS</text>";
        } else if (hours_left > 0) {
            parts[10] = Strings.toString(hours_left);
            parts[11] = " HOURS</text>";
        } else if (minutes_left > 0) {
            parts[10] = Strings.toString(minutes_left);
            parts[11] = " MINUTES</text>";
        } else if (seconds_left > 0) {
            parts[10] = Strings.toString(seconds_left);
            parts[11] = " SECONDS</text>";
        } else {
            parts[10] = "EXPIRED";
            parts[11] = "</text>";
        }
        // Pack all the pieces
        string memory svg = string(
            abi.encodePacked(parts[0], parts[1], parts[2], parts[3])
        );
        svg = string(abi.encodePacked(svg, parts[4], parts[5], parts[6]));
        svg = string(abi.encodePacked(svg, parts[7], parts[8], parts[9]));
        svg = string(abi.encodePacked(svg, parts[10], parts[11], parts[12]));
        svg = string(abi.encodePacked(svg, parts[13], parts[14]));
        return svg;
    }

    function render(
        uint256 deal_index,
        string memory data_uri,
        uint256 value,
        uint256 timestamp_start,
        uint256 duration,
        bool appeal,
        address owner
    ) external view returns (string memory) {
        if (contains("ipfs://", data_uri)) {
            string memory json_parts = string(
                abi.encodePacked(
                    '{"name": "DEAL #',
                    Strings.toString(deal_index),
                    '",',
                    '"description": "Retriev deal token", "image": "data:image/svg+xml;base64,'
                )
            );
            string memory svg = image(
                data_uri,
                timestamp_start,
                duration,
                appeal
            );
            json_parts = string(
                abi.encodePacked(json_parts, Base64.encode(bytes(svg)))
            );
            // Appeal text
            string memory appeal_text;
            if (appeal) {
                appeal_text = "YES";
            } else {
                appeal_text = "NO";
            }

            json_parts = string(
                abi.encodePacked(
                    json_parts,
                    '", "attributes": [',
                    '{"trait_type": "DATA URI", "value": "',
                    data_uri,
                    '"},',
                    '{"trait_type": "VALUE", "value": "',
                    Strings.toString(value),
                    ' WEI"},',
                    '{"trait_type": "APPEAL", "value": "',
                    appeal_text,
                    '"},',
                    '{"trait_type": "OWNER", "value": "0x',
                    toAsciiString(owner),
                    '"}',
                    "]}"
                )
            );

            string memory json = Base64.encode(bytes(json_parts));

            string memory output = string(
                abi.encodePacked("data:application/json;base64,", json)
            );
            return output;
        } else {
            return "";
        }
    }
}
