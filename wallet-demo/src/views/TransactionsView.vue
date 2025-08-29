<template>
  <div class="transactions-view">
    <div class="header">
      <h1>Transaction History</h1>
      <router-link to="/wallet" class="back-btn">← Back to Wallet</router-link>
    </div>

    <div v-if="!currentWallet" class="no-wallet">
      <p>Please add a wallet first</p>
      <router-link to="/add-wallet" class="btn-primary">Add Wallet</router-link>
    </div>

    <div v-else class="transactions-content">
      <div class="wallet-info">
        <h3>{{ currentWallet.name }}</h3>
        <p>{{ formatAddress(currentWallet.address) }}</p>
      </div>

      <div class="transaction-tabs">
        <button 
          :class="{ active: activeTab === 'tx' }"
          @click="activeTab = 'tx'"
          class="tab-btn"
        >
          Regular Transactions
        </button>
        <button 
          :class="{ active: activeTab === 'token' }"
          @click="activeTab = 'token'"
          class="tab-btn"
        >
          Token Transactions
        </button>
      </div>

      <div class="refresh-section">
        <button @click="refreshTransactions" :disabled="loading" class="refresh-btn">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div class="transactions-list">
        <div v-if="currentTransactions.length === 0" class="empty-state">
          <p>No {{ activeTab === 'tx' ? 'regular' : 'token' }} transactions found</p>
        </div>
        <div v-else>
          <div v-for="tx in currentTransactions" :key="tx.txHash" class="transaction-item">
            <div class="tx-info">
              <div class="tx-hash">
                <a :href="getExplorerUrl(tx.txHash)" target="_blank" rel="noopener">
                  {{ formatHash(tx.txHash) }}
                </a>
              </div>
              <div class="tx-details">
                <div class="tx-type">{{ getTransactionTypeText(tx.type) }}</div>
                <div class="tx-addresses">
                  <span>From: {{ formatAddress(tx.fromAddress) }}</span>
                  <span>To: {{ formatAddress(tx.toAddress) }}</span>
                </div>
              </div>
            </div>
            <div class="tx-meta">
              <div class="tx-value">{{ formatValue(tx.value) }} ETH</div>
              <div class="tx-status" :class="getStatusClass(tx.status)">
                {{ getStatusText(tx.status) }}
              </div>
              <div class="tx-time">{{ formatTime(tx.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { TransactionType, TransactionStatus } from '@/types/wallet'

const walletStore = useWalletStore()
const activeTab = ref<'tx' | 'token'>('tx')

const { currentWallet, transactions, tokenTransactions, loading } = walletStore

const currentTransactions = computed(() => {
  return activeTab.value === 'tx' ? transactions : tokenTransactions
})

const refreshTransactions = async () => {
  if (activeTab.value === 'tx') {
    await walletStore.fetchTransactions()
  } else {
    await walletStore.fetchTokenTransactions()
  }
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatHash = (hash: string) => {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

const formatValue = (value: string) => {
  const num = parseFloat(value) / 1e18 // Convert from wei
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  return num.toFixed(6)
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const getTransactionTypeText = (type: number) => {
  switch (type) {
    case TransactionType.TRANSFER:
      return 'Transfer'
    case TransactionType.APPROVE:
      return 'Approve'
    case TransactionType.CONTRACT_INTERACTION:
      return 'Contract'
    default:
      return 'Unknown'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return 'Success'
    case TransactionStatus.FAILED:
      return 'Failed'
    default:
      return 'Unknown'
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return 'success'
    case TransactionStatus.FAILED:
      return 'failed'
    default:
      return 'unknown'
  }
}

const getExplorerUrl = (txHash: string) => {
  return `https://optimistic.etherscan.io/tx/${txHash}`
}

onMounted(async () => {
  if (currentWallet) {
    await refreshTransactions()
  }
})
</script>

<style scoped>
.transactions-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  background: #95a5a6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}

.back-btn:hover {
  background: #7f8c8d;
}

.no-wallet {
  text-align: center;
  padding: 60px 20px;
}

.no-wallet p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.btn-primary {
  background: #3498db;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  background: #2980b9;
}

.wallet-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.wallet-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.wallet-info p {
  margin: 0;
  color: #7f8c8d;
  font-family: monospace;
}

.transaction-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #7f8c8d;
  font-size: 16px;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-btn:hover {
  color: #2c3e50;
}

.refresh-section {
  margin-bottom: 20px;
}

.refresh-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-btn:hover:not(:disabled) {
  background: #229954;
}

.refresh-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #7f8c8d;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  background: white;
}

.tx-info {
  flex: 1;
}

.tx-hash a {
  color: #3498db;
  text-decoration: none;
  font-family: monospace;
  font-weight: 600;
}

.tx-hash a:hover {
  text-decoration: underline;
}

.tx-details {
  margin-top: 8px;
}

.tx-type {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.tx-addresses {
  font-size: 14px;
  color: #7f8c8d;
  font-family: monospace;
}

.tx-addresses span {
  display: block;
  margin-bottom: 2px;
}

.tx-meta {
  text-align: right;
  min-width: 120px;
}

.tx-value {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.tx-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tx-status.success {
  background: #d4edda;
  color: #155724;
}

.tx-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.tx-status.unknown {
  background: #e2e3e5;
  color: #383d41;
}

.tx-time {
  font-size: 12px;
  color: #7f8c8d;
}
</style>