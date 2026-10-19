# Assignment 3 Ethereum and Solidity

Source files for Assignment / Lab 3, Session 4.

| File | Question | Purpose | Compiler |
| --- | --- | --- | --- |
| StorageTest.sol | 1(d) | Store a 32-element bytes32 array and measure transaction gas | Solidity 0.5.1 |
| HelloWorld.sol | 5(d), 5(e), 5(g) | Return the exact string Hello, world! | Solidity 0.5.1 |
| Dangerous.sol | 6 | Original vulnerable contract supplied in the assignment; imported by ReentrancyDemo | Solidity 0.4.24 |
| ReentrancyDemo.sol | 6(d) | Demonstrate reentrancy against a locally deployed Dangerous instance | Solidity 0.4.24 |
| SafeDeposits.sol | 6(e) | Demonstrate checks-effects-interactions and a reentrancy lock | Solidity 0.4.24 |

## Compilation

Use the exact compiler versions listed above. The Solidity 0.4.24 files and Solidity 0.5.1 files are separate compilation groups.

- StorageTest: optimizer disabled; compiler EVM target Byzantium. The report measured the first put call on a fresh contract with the 32 nonzero bytes32 values from the assignment, using Remix VM Osaka.
- HelloWorld: optimizer enabled with 200 runs; compiler EVM target Byzantium.
- Reentrancy example: compiler 0.4.24, optimizer disabled, EVM target Byzantium. Keep Dangerous.sol and ReentrancyDemo.sol in the same folder so the relative import resolves.

## Sepolia result for question 5(g)

- Contract: 0x7732a6c0502F229B032f91570aDcd29314aB7596
- hello() calldata: 0x19ff1d21
- Transaction value: 0 ETH
- Successful call transaction: https://sepolia.etherscan.io/tx/0xfcec60be36cbf823fbe66b69677ebb6e5ec1d2eb5fe2b0842dcd7f213c47068d
- Block: 11945076
- Read-only function result: Hello, world!

A read-only call displays the return string. An ordinary transaction receipt does not directly include the Solidity return value.

## Local classroom demonstration for question 6

Dangerous.sol is intentionally vulnerable. The demonstration was tested only against a locally deployed instance with simulated balances. The original contract held 5.5 ETH from another simulated account; the demonstration deposited 2 ETH and received the full 7.5 ETH. The same attempt reverted against SafeDeposits, preserving the existing 5.5 ETH; an ordinary 1 ETH withdrawal passed.

The Word report contains the explanations, measurements, and screenshot evidence. Upload these individual source files and this README into the assignment3 folder of the existing course repository.
