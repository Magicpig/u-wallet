<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()
const { wallets, currentWallet } = walletStore
</script>

<template>
  <div class="home-view">
    <div class="hero-section">
      <h1>Welcome to Simple Wallet</h1>
      <p>A simple wallet demo for Optimism chain</p>
      
      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-number">{{ wallets.length }}</div>
          <div class="stat-label">Wallets</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">OP</div>
          <div class="stat-label">Chain</div>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <div class="action-cards">
        <router-link to="/add-wallet" class="action-card">
          <div class="card-icon">+</div>
          <h3>Add Wallet</h3>
          <p>Add a new wallet address to track</p>
        </router-link>
        
        <router-link to="/wallet" class="action-card" :class="{ disabled: !currentWallet }">
          <div class="card-icon">💰</div>
          <h3>View Balance</h3>
          <p>Check your wallet balance and assets</p>
        </router-link>
        
        <router-link to="/transactions" class="action-card" :class="{ disabled: !currentWallet }">
          <div class="card-icon">📊</div>
          <h3>Transaction History</h3>
          <p>View your transaction history</p>
        </router-link>
      </div>
    </div>

    <div v-if="currentWallet" class="current-wallet-info">
      <h3>Current Wallet</h3>
      <div class="wallet-card">
        <div class="wallet-name">{{ currentWallet.name }}</div>
        <div class="wallet-address">{{ currentWallet.address }}</div>
        <div class="wallet-chain">Optimism Network</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 60px;
}

.hero-section h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 1rem;
}

.actions-section {
  margin-bottom: 60px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.action-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.action-card p {
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0;
}

.current-wallet-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
}

.current-wallet-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.wallet-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.wallet-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.wallet-address {
  font-family: monospace;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.wallet-chain {
  color: #27ae60;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .quick-stats {
    gap: 2rem;
  }
  
  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
