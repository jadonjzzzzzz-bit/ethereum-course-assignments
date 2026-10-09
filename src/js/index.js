import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import './../css/index.css';

// The Casino contract deployed for this assignment on Sepolia.
const CONTRACT_ADDRESS = '0x364924fEa0B8E54B377246F1E6d0cd60e43e47b4';
const SEPOLIA_CHAIN_ID = '0xaa36a7';
const ABI = [
  'function minimumBet() view returns (uint256)',
  'function totalBet() view returns (uint256)',
  'function numberOfBets() view returns (uint256)',
  'function maxAmountOfBets() view returns (uint256)',
  'function numberWinner() view returns (uint256)',
  'function checkPlayerExists(address player) returns (bool)',
  'function bet(uint256 numberToBet) payable'
];

function walletProvider() {
  const injected = window.ethereum;
  return injected?.providers?.find(provider => provider.isMetaMask) || injected;
}

function errorMessage(error) {
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'The wallet request was cancelled. You can try again.';
  }
  return error.shortMessage || error.reason || error.message || 'Request failed.';
}

// Every displayed statistic is read from the deployed contract.
async function readSnapshot(contract, account) {
  const [minimum, total, count, maximum, winner, alreadyBet] = await Promise.all([
    contract.minimumBet(),
    contract.totalBet(),
    contract.numberOfBets(),
    contract.maxAmountOfBets(),
    contract.numberWinner(),
    contract.checkPlayerExists.staticCall(account)
  ]);
  return {
    minimum: formatEther(minimum), minimumWei: minimum,
    total: formatEther(total), count: count.toString(),
    maximum: maximum.toString(), winner: winner.toString(), alreadyBet
  };
}

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [stats, setStats] = useState(null);
  const [amount, setAmount] = useState('0.001');
  const [number, setNumber] = useState(7);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Connect MetaMask to load the contract data.');
  const [readError, setReadError] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    const wallet = walletProvider();
    if (!wallet?.on) return;
    const reset = () => {
      setContract(null);
      setStats(null);
      setAccount('');
      setReadError('');
      setTransactionHash('');
      setStatus('Your wallet account or network changed. Please reconnect.');
    };
    wallet.on('accountsChanged', reset);
    wallet.on('chainChanged', reset);
    return () => {
      wallet.removeListener('accountsChanged', reset);
      wallet.removeListener('chainChanged', reset);
    };
  }, []);

  useEffect(() => {
    if (!contract || !account) return;
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const snapshot = await readSnapshot(contract, account);
        if (active) { setStats(snapshot); setReadError(''); }
      } catch (error) {
        if (active) setReadError(errorMessage(error));
      } finally { loading = false; }
    };
    const timer = setInterval(refresh, 7000);
    return () => { active = false; clearInterval(timer); };
  }, [contract, account]);

  async function connect() {
    setBusy(true);
    setReadError('');
    setStatus('Connecting to MetaMask...');
    try {
      const wallet = walletProvider();
      if (!wallet) throw new Error('Open this page in the browser with MetaMask installed.');
      await wallet.request({ method: 'eth_requestAccounts' });
      const chainId = await wallet.request({ method: 'eth_chainId' });
      if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        await wallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
      }
      const provider = new BrowserProvider(wallet);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      if (await provider.getCode(CONTRACT_ADDRESS) === '0x') {
        throw new Error('The Casino contract was not found on this network.');
      }
      const instance = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const snapshot = await readSnapshot(instance, address);
      setAccount(address);
      setContract(instance);
      setStats(snapshot);
      setAmount(snapshot.minimum);
      setStatus('Connected to Sepolia. Contract data loaded.');
    } catch (error) { setStatus(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function placeBet() {
    setBusy(true);
    setReadError('');
    setTransactionHash('');
    try {
      if (!contract || !account) throw new Error('Connect MetaMask first.');
      const snapshot = await readSnapshot(contract, account);
      setStats(snapshot);
      if (snapshot.alreadyBet) throw new Error('This account has already placed its bet.');
      if (BigInt(snapshot.count) >= BigInt(snapshot.maximum)) {
        throw new Error('The maximum number of bets has been reached.');
      }
      const value = parseEther(amount.trim());
      if (value < snapshot.minimumWei) throw new Error('The amount is below the minimum bet.');
      // Simulate the call before requesting a transaction from the wallet.
      await contract.bet.staticCall(number, { value });
      setStatus('Review the Sepolia test-ETH transaction in MetaMask.');
      const transaction = await contract.bet(number, { value });
      setTransactionHash(transaction.hash);
      setStatus('Transaction submitted. Waiting for blockchain confirmation...');
      const receipt = await transaction.wait();
      if (receipt.status !== 1) throw new Error('The transaction did not succeed.');
      setTransactionHash(receipt.hash);
      setStatus('Bet confirmed on Sepolia.');
      try { setStats(await readSnapshot(contract, account)); }
      catch (error) { setReadError(errorMessage(error)); }
    } catch (error) { setStatus(errorMessage(error)); }
    finally { setBusy(false); }
  }

  const buttonStyle = { padding: '12px 20px', margin: '12px 0', cursor: 'pointer' };
  const full = stats && BigInt(stats.count) >= BigInt(stats.maximum);
  return (
    <div className="main-container">
      <h1>Casino Ethereum DApp</h1>
      <p>Network: <b>Sepolia Test Network</b></p>
      <p style={{ overflowWrap: 'anywhere' }}>Contract: {CONTRACT_ADDRESS}</p>
      <p style={{ overflowWrap: 'anywhere' }}>Wallet: {account || 'Not connected'}</p>
      <button style={buttonStyle} onClick={connect} disabled={busy}>
        {account ? 'Reconnect MetaMask' : 'Connect MetaMask'}
      </button>
      <div className="block"><b>Number of bets:</b>&nbsp;{stats?.count ?? '--'}</div>
      <div className="block"><b>Last number winner:</b>&nbsp;{stats?.winner ?? '--'}</div>
      <div className="block"><b>Total ether bet:</b>&nbsp;{stats?.total ?? '--'} ETH</div>
      <div className="block"><b>Minimum bet:</b>&nbsp;{stats?.minimum ?? '--'} ETH</div>
      <div className="block"><b>Max amount of bets:</b>&nbsp;{stats?.maximum ?? '--'}</div>
      <hr />
      <h2>Choose a number from 1 to 10</h2>
      <label>Bet amount (Sepolia ETH):
        <input className="bet-input" type="number" min={stats?.minimum || '0.001'}
          step="0.001" value={amount} onChange={event => setAmount(event.target.value)}
          disabled={busy} />
      </label>
      <ul aria-label="Choose a number">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
          <li key={value} className={number === value ? 'number-selected' : ''}
            onClick={() => { if (!busy) setNumber(value); }}>{value}</li>
        ))}
      </ul>
      <p>Selected number: <b>{number}</b></p>
      <button style={buttonStyle} onClick={placeBet}
        disabled={busy || !stats || stats.alreadyBet || full}>
        {busy ? 'Please wait...' : 'Place Bet'}
      </button>
      {stats?.alreadyBet && <p>This wallet has already placed its bet.</p>}
      <p role="status"><b>Status:</b> {status}</p>
      {readError && <p role="alert">Contract data refresh failed: {readError}</p>}
      {transactionHash && <p style={{ overflowWrap: 'anywhere' }}>
        <b>Transaction:</b>&nbsp;
        <a href={'https://sepolia.etherscan.io/tx/' + transactionHash}
          target="_blank" rel="noreferrer">{transactionHash}</a>
      </p>}
      <hr />
      <p>This tutorial contract accepts one bet per wallet address.</p>
      <p>The contract requests its random draw when the maximum number of bets is reached.</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
