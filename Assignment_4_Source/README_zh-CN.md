# Assignment 4 配套源码与操作清单

这份源码包对应 Assignment / Lab #4。Truffle 项目包含 XYZCoin ERC-20 合约、部署迁移和 9 个 JavaScript 测试；Infura 项目包含 Web3.js 扫描脚本。脚本会从区块 0 开始按升序检查交易，在第一个 to 等于 null 的合约创建交易处停止。

## 需要你完成的操作

1. 打开 infura-web3，将 .env.example 复制为 .env。在 Infura 创建 Ethereum Mainnet 项目后，把 API key 填入本机 .env。不要提交 .env。
2. 在 infura-web3 目录运行 npm install，再运行 npm start。记录程序输出的区块号、交易哈希，并截取终端结果放入报告。
3. 在 truffle-project 目录运行 npm install 和 npm run compile。测试前先在一个终端运行 `npx ganache --server.port 8545` 并保持窗口打开，再在另一个终端运行 `npm test`。测试通过后保存终端结果。也可以运行 npm run develop，在 Truffle Develop 提示符中输入 migrate，查看 XYZCoin 的本地部署地址。
4. 在 Etherscan 的 Gas Tracker 重新记录提交当天的 Average Gas Price 和 ETH/USD。报告给出的 10 个区块是按每次 50,000 gas 估算的；若实时数据不同，请按公式更新：

~~~text
feeUSD = gasUsed × gasPriceGwei × 10^-9 × ETH_USD
blocksPerUpdate = ceil(7200 / floor(10 / feeUSD))
~~~

5. 把 truffle-project 和 infura-web3 的源文件复制到课程指定的同一个 GitHub 仓库，检查 .env 没有被加入，然后 commit 和 push。按课程 PDF 的要求添加 Instructor 和 TA 为 repository contributors，并在 LMS 提交报告及仓库链接。
6. 阅读并核对答案，按课程规定披露 AI 辅助。封面上的签名和日期由你本人填写。

## 运行命令

~~~powershell
cd truffle-project
npm install
npm run compile
npm test
npm run develop
~~~

注意：运行 `npm test` 前，先在另一个终端窗口启动本地链：

~~~cmd
npx ganache --server.port 8545
~~~

~~~powershell
cd infura-web3
Copy-Item .env.example .env
# 编辑 .env 后运行
npm install
npm start
~~~

## 项目文件

- truffle-project/contracts/ERC20.sol：ERC-20 函数和事件接口。
- truffle-project/contracts/XYZCoin.sol：固定发行量 1,000、0 位小数的代币。
- truffle-project/migrations/2_xyz_coin.js：部署 XYZCoin。
- truffle-project/test/xyz_coin.js：名称、发行量、转账、授权、事件和失败场景测试。
- infura-web3/index.js：通过 Infura JSON-RPC 和 Web3.js 扫描合约创建交易。

## 关于区块扫描速度

每个区块请求都需要一次 JSON-RPC 调用。脚本默认以 3 个区块为一批并发请求，并在每批之间等待 1 秒，再按区块顺序检查，确保返回最早的匹配项。这样可以降低 Infura 吞吐限额触发的风险。若要从头扫描整条主网，仍可能受到 Infura 配额和限流影响；程序会在发现第一条匹配交易时停止。
