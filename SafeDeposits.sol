pragma solidity ^0.4.24;

contract SafeDeposits {
    mapping(address => uint) public deposits;
    bool private locked;

    modifier nonReentrant() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    function depositMoney() public payable {
        uint updated = deposits[msg.sender] + msg.value;
        require(updated >= deposits[msg.sender]);
        deposits[msg.sender] = updated;
    }

    function withdraw(uint amount) public nonReentrant {
        require(amount > 0 && deposits[msg.sender] >= amount);
        deposits[msg.sender] -= amount;
        require(msg.sender.call.value(amount)());
    }
}
