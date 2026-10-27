pragma solidity 0.5.1;

import "./ERC20.sol";

contract XYZCoin is ERC20 {
    string private tokenName;
    string private tokenSymbol;
    uint8 private tokenDecimals;
    uint256 private supply;

    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

    constructor() public {
        tokenName = "XYZCoin";
        tokenSymbol = "XYZ";
        tokenDecimals = 0;
        supply = 1000;
        balances[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }

    function name() external view returns (string memory) {
        return tokenName;
    }

    function symbol() external view returns (string memory) {
        return tokenSymbol;
    }

    function decimals() external view returns (uint8) {
        return tokenDecimals;
    }

    function totalSupply() external view returns (uint256) {
        return supply;
    }

    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) external returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {
        require(allowed[_from][msg.sender] >= _value, "XYZCoin: allowance exceeded");
        allowed[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "XYZCoin: transfer to zero address");
        require(balances[_from] >= _value, "XYZCoin: insufficient balance");
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
    }
}
