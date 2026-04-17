'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { 
  callReadOnlyFunction, 
  makeContractCall,
  uintCV,
  PostConditionMode,
  principalCV
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();
const contractAddress = 'ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96';
const contractName = 'b2s-rewards-distributor';

export default function RewardsDistributor() {
  const { address, isConnected } = useWallet();
  const [stakedAmount, setStakedAmount] = useState(120);
  const [pendingRewards, setPendingRewards] = useState(1.25);
  const [totalEarned, setTotalEarned] = useState(42.8);
  const [stakeInput, setStakeInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address && isConnected) {
      fetchStakerInfo();
    }
  }, [address, isConnected]);

  // Simulate fetching data (no hard reset)
  const fetchStakerInfo = async () => {
    if (!address) return;

    setStakedAmount((prev) => prev || 120);
    setPendingRewards((prev) => prev || 1.25);
    setTotalEarned((prev) => prev || 42.8);
  };

  // Simulate reward growth over time
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setPendingRewards((prev) => {
        if (stakedAmount === 0) return prev;
        return prev + stakedAmount * 0.00002;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, stakedAmount]);

  // Fake transaction handler
  const simulateTx = async (callback?: () => void) => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1200));
      callback?.();
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeInput) return;

    const amount = parseFloat(stakeInput);
    if (!amount || amount <= 0) return;

    await simulateTx(() => {
      setStakedAmount((prev) => prev + amount);
      setStakeInput('');
    });
  };

  const handleClaimRewards = async () => {
    if (!address || pendingRewards <= 0) return;

    await simulateTx(() => {
      setTotalEarned((prev) => prev + pendingRewards);
      setPendingRewards(0);
    });
  };

  const handleUnstake = async () => {
    if (!address || !stakeInput) return;

    const amount = parseFloat(stakeInput);
    if (!amount || amount > stakedAmount) return;

    await simulateTx(() => {
      setStakedAmount((prev) => prev - amount);
      setStakeInput('');
    });
  };

  if (!isConnected) {
    return (
      <div className="rewards-container bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
        <p className="text-white/70 text-lg">Please connect your wallet to access rewards distribution</p>
      </div>
    );
  }

  return (
    <div className="rewards-distributor">
      <h2 className="text-3xl font-bold text-white text-center mb-8">💰 Rewards Distributor</h2>
      
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-white/70 text-sm mb-2">Staked Amount</h3>
          <p className="amount text-3xl font-bold text-white">{stakedAmount.toFixed(2)} $B2S</p>
        </div>
        
        <div className="stat-card pending bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
          <h3 className="text-white/70 text-sm mb-2">Pending Rewards</h3>
          <p className="amount text-3xl font-bold text-green-400">{pendingRewards.toFixed(6)} $B2S</p>

          <p className="text-xs text-white/50 mt-2">
            ~{(pendingRewards * 0.85).toFixed(4)} $B2S after fees
          </p>

          <button 
            onClick={handleClaimRewards}
            disabled={loading || pendingRewards === 0}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-white/70 text-sm mb-2">Total Earned</h3>
          <p className="amount text-3xl font-bold text-purple-400">{totalEarned.toFixed(2)} $B2S</p>
        </div>
      </div>

      <div className="action-section bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold text-xl mb-4">Manage Staking</h3>
        
        <div className="input-group relative mb-4">
          <input
            type="number"
            value={stakeInput}
            onChange={(e) => setStakeInput(e.target.value)}
            placeholder="Enter amount"
            disabled={loading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
          <span className="currency absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">$B2S</span>
        </div>

        <div className="button-group grid grid-cols-2 gap-4">
          <button 
            onClick={handleStake}
            disabled={loading || !stakeInput || parseFloat(stakeInput) <= 0}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Processing...' : 'Stake'}
          </button>
          
          <button 
            onClick={handleUnstake}
            disabled={loading || !stakeInput || parseFloat(stakeInput) <= 0}
            className="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold border border-white/20 transition-all"
          >
            {loading ? 'Processing...' : 'Unstake'}
          </button>
        </div>
      </div>

      <div className="info-note mt-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded text-white/80 text-sm">
        <p>
          <strong>Note:</strong> Staked tokens earn continuous rewards at 12.5% APY. You can unstake at any time without penalties.
        </p>
      </div>
    </div>
  );
}
