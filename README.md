# Assignment 2 Casino DApp

This coursework project adapts the Casino Ethereum tutorial for a local React frontend connected to MetaMask on the Ethereum Sepolia test network. It retains React, Webpack and Babel and uses ethers 6 for the wallet connection.

## Run locally

Install Node.js, then run these commands from the project directory:

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:8080 in a browser with MetaMask installed. Connect the wallet on Sepolia (chain ID 11155111). The checked-in `dist` files are the build used in the local browser test.

## Contract and test result

- Contract: `0x364924fEa0B8E54B377246F1E6d0cd60e43e47b4`
- Solidity compiler used in Remix: 0.4.22
- Constructor minimum bet: `1000000000000000` wei (0.001 Sepolia ETH)
- Constructor maximum number of bets: `100`
- Deployment transaction: `0x1c75429444db7f44532accf08b0716fec275b0ff00a3c83a3f4dd77a7ab880e1`
- Browser test: number 7, amount 0.001 Sepolia ETH
- Observed browser result: "Bet confirmed on Sepolia."
- Bet transaction: `0xc9a061e42ec4da2366c252230508a4be310ae021c655f02ec36ed7281092efe0`

The test demonstrated frontend rendering, a wallet connection and one confirmed bet. The contract requests its random draw after 100 bets. The draw, prize distribution, IPFS hosting and a custom domain were not tested. This tutorial contract accepts only one bet per wallet address until its stored player data is cleared; the submitted source has no round-reset mechanism for that data.

The source in `contracts/Casino.sol` uses the compiler pragma and local import used in Remix. Both it and its `oraclizeAPI_0.4.sol` dependency are included. The frontend is configured for the already deployed contract address above.

## Files

- `src/`: editable React and CSS sources
- `contracts/`: Casino Solidity source and its oracle API dependency
- `dist/`: HTML and compiled frontend used by the local server
- `package.json` and `package-lock.json`: dependencies and reproducible installation
- `webpack.config.js`: frontend build configuration
- `LICENSE`: original tutorial MIT license

## Source attribution

Original Casino tutorial and contract by Merunas Grincalaitis (merlox):
https://github.com/merlox/casino-ethereum

Oracle API source:
https://github.com/provable-things/ethereum-api/blob/master/old-contracts/previous-api-contracts/oraclizeAPI_0.4.sol

Original license and copyright notices are retained.
