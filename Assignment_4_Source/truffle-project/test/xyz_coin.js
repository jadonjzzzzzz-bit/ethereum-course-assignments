const XYZCoin = artifacts.require("XYZCoin");
const truffleAssert = require("truffle-assertions");

contract("XYZCoin", function (accounts) {
  const owner = accounts[0];
  const spender = accounts[1];
  const recipient = accounts[2];
  let token;

  beforeEach(async function () {
    token = await XYZCoin.new({ from: owner });
  });

  it("sets the token name, symbol, decimals, and supply", async function () {
    assert.equal(await token.name(), "XYZCoin");
    assert.equal(await token.symbol(), "XYZ");
    assert.equal((await token.decimals()).toString(), "0");
    assert.equal((await token.totalSupply()).toString(), "1000");
  });

  it("assigns the full supply to the creator", async function () {
    assert.equal((await token.balanceOf(owner)).toString(), "1000");
    assert.equal((await token.balanceOf(recipient)).toString(), "0");
  });

  it("transfers tokens and emits Transfer", async function () {
    const tx = await token.transfer(recipient, 40, { from: owner });
    assert.equal((await token.balanceOf(owner)).toString(), "960");
    assert.equal((await token.balanceOf(recipient)).toString(), "40");
    truffleAssert.eventEmitted(tx, "Transfer", function (event) {
      return event._from === owner && event._to === recipient && event._value.toString() === "40";
    });
  });

  it("fires Transfer for a zero-value transfer", async function () {
    const tx = await token.transfer(recipient, 0, { from: owner });
    truffleAssert.eventEmitted(tx, "Transfer", function (event) {
      return event._from === owner && event._to === recipient && event._value.toString() === "0";
    });
  });

  it("sets and reads allowance and emits Approval", async function () {
    const tx = await token.approve(spender, 75, { from: owner });
    assert.equal((await token.allowance(owner, spender)).toString(), "75");
    truffleAssert.eventEmitted(tx, "Approval", function (event) {
      return event._owner === owner && event._spender === spender && event._value.toString() === "75";
    });
  });

  it("lets an approved account transfer tokens and emits Transfer", async function () {
    await token.approve(spender, 75, { from: owner });
    const tx = await token.transferFrom(owner, recipient, 30, { from: spender });
    assert.equal((await token.balanceOf(owner)).toString(), "970");
    assert.equal((await token.balanceOf(recipient)).toString(), "30");
    assert.equal((await token.allowance(owner, spender)).toString(), "45");
    truffleAssert.eventEmitted(tx, "Transfer", function (event) {
      return event._from === owner && event._to === recipient && event._value.toString() === "30";
    });
  });

  it("fires Transfer for a zero-value transferFrom", async function () {
    await token.approve(spender, 1, { from: owner });
    const tx = await token.transferFrom(owner, recipient, 0, { from: spender });
    truffleAssert.eventEmitted(tx, "Transfer", function (event) {
      return event._from === owner && event._to === recipient && event._value.toString() === "0";
    });
  });

  it("reverts when the sender has insufficient balance", async function () {
    await truffleAssert.reverts(
      token.transfer(recipient, 1, { from: spender }),
      "XYZCoin: insufficient balance"
    );
  });

  it("reverts when transferFrom has no explicit authorization", async function () {
    await truffleAssert.reverts(
      token.transferFrom(owner, recipient, 1, { from: spender }),
      "XYZCoin: allowance exceeded"
    );
  });
});
