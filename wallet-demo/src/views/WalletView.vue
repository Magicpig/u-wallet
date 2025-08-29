<template>
  <div class="wallet-view">
    <!-- No wallet state -->
    <div v-if="wallets.length === 0" class="no-wallet-state">
      <div class="welcome-message">
        <h2>Welcome to Simple Wallet</h2>
        <p>Add your first wallet to get started</p>
        <button @click="$router.push('/add-wallet')" class="add-wallet-btn">
          Add Wallet
        </button>
      </div>
    </div>

    <!-- Wallet content -->
    <div v-else class="wallet-content">
      <!-- Wallet selector at top -->
      <div class="wallet-selector-section">
        <div class="custom-wallet-selector">
          <div class="wallet-selector-trigger" @click="toggleDropdown">
            <div class="selected-wallet">
              <div class="wallet-name">{{ selectedWallet?.name || 'Select Wallet' }}</div>
              <div class="wallet-address">{{ selectedWallet?.address || '' }}</div>
            </div>
            <div class="dropdown-arrow" :class="{ 'open': dropdownOpen }">▼</div>
          </div>
          
          <div v-if="dropdownOpen" class="wallet-dropdown">
            <div 
              v-for="wallet in wallets" 
              :key="wallet.address" 
              class="wallet-option"
              :class="{ 'selected': selectedWallet?.address === wallet.address }"
              @click="selectWalletOption(wallet)"
            >
              <div class="wallet-name">{{ wallet.name }}</div>
              <div class="wallet-address">{{ wallet.address }}</div>
            </div>
            <div class="wallet-option add-wallet-option" @click="addNewWallet">
              <div class="add-wallet-text">+ Add New Wallet</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance section -->
      <div class="balance-section">
        <div class="total-balance">
          <span class="balance-label">Total Balance</span>
          <span class="balance-amount">${{ totalBalance }}</span>
        </div>
      </div>

      <!-- Assets section -->
      <div class="assets-section">
        <h3 class="section-title">Assets</h3>
        <div v-if="loading" class="loading">Loading assets...</div>
        <div v-else-if="assets.length === 0" class="empty-state">
          <p>No assets found</p>
        </div>
        <div v-else class="assets-list">
          <div v-for="asset in assets" :key="asset.tokenSymbol" class="asset-item">
            <div class="asset-info">
              <img v-if="asset.thumbnail" :src="asset.thumbnail" :alt="asset.tokenSymbol" class="token-icon">
              <div class="token-placeholder" v-else>{{ asset.tokenSymbol.charAt(0) }}</div>
              <div class="asset-details">
                <div class="token-name">{{ asset.tokenName }}</div>
                <div class="token-symbol">{{ asset.tokenSymbol }}</div>
              </div>
            </div>
            <div class="asset-balance">
              <div class="balance-amount">{{ formatBalance(asset.balance) }}</div>
              <div class="balance-usd">${{ asset.balanceUsd }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions section with tabs -->
      <div class="transactions-section">
        <div class="transaction-tabs">
          <button 
            @click="transactionType = 'native'" 
            :class="['tab-btn', { active: transactionType === 'native' }]"
          >
            Transactions
          </button>
          <button 
            @click="transactionType = 'token'" 
            :class="['tab-btn', { active: transactionType === 'token' }]"
          >
            Token Transactions
          </button>
        </div>
        
        <div class="transactions-content">
          <div v-if="isCurrentTransactionsLoading && currentTransactions.length === 0" class="loading">
            Loading transactions...
          </div>
          <div v-else-if="currentTransactions.length === 0" class="empty-state">
            <p>No {{ transactionType }} transactions found</p>
          </div>
          <div v-else class="transactions-list">
            <div v-for="tx in currentTransactions" :key="getTransactionKey(tx)" class="transaction-item">
              <div class="tx-info">
                <div class="tx-type">{{ getTransactionTypeDisplay(tx) }}</div>
                <div class="tx-hash">{{ formatAddress(getTransactionHash(tx)) }}</div>
                <div class="tx-time">{{ formatTime(getTransactionTimestamp(tx)) }}</div>
              </div>
              <div class="tx-details">
                <div class="tx-amount">{{ getTransactionAmount(tx) }}</div>
                <div class="tx-status" :class="getTransactionStatusClass(tx)">{{ getTransactionStatusDisplay(tx) }}</div>
              </div>
            </div>
            
            <!-- Load more button -->
            <div v-if="hasMoreCurrentTransactions" class="load-more-section">
              <button 
                @click="loadMoreTransactions" 
                :disabled="isCurrentTransactionsLoading"
                class="load-more-btn"
              >
                {{ isCurrentTransactionsLoading ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import type { Wallet, TransactionItem, TokenTransferItem, TransactionType, TransactionStatus } from '@/types/wallet'

const walletStore = useWalletStore()
const selectedWallet = ref<Wallet | null>(null)
const activeTab = ref('assets')
const transactionType = ref<'native' | 'token'>('native')
const dropdownOpen = ref(false)

// Use computed to maintain reactivity
const wallets = computed(() => walletStore.wallets)
const currentWallet = computed(() => walletStore.currentWallet)
const assets = computed(() => walletStore.assets)
const loading = computed(() => walletStore.loading)
const transactionsLoading = computed(() => walletStore.transactionsLoading)
const tokenTransactionsLoading = computed(() => walletStore.tokenTransactionsLoading)
const hasMoreTransactions = computed(() => walletStore.hasMoreTransactions)
const hasMoreTokenTransactions = computed(() => walletStore.hasMoreTokenTransactions)
const totalBalance = computed(() => walletStore.totalBalance)
const transactions = computed(() => walletStore.transactions)
const tokenTransactions = computed(() => walletStore.tokenTransactions)

// Computed for current transaction state
const isCurrentTransactionsLoading = computed(() => {
  return transactionType.value === 'native' ? transactionsLoading.value : tokenTransactionsLoading.value
})

const hasMoreCurrentTransactions = computed(() => {
  return transactionType.value === 'native' ? hasMoreTransactions.value : hasMoreTokenTransactions.value
})

const currentTransactions = computed(() => {
  return transactionType.value === 'native' ? transactions.value : tokenTransactions.value
})

const loadMoreTransactions = async () => {
  if (transactionType.value === 'native') {
    await walletStore.fetchTransactions(true)
  } else {
    await walletStore.fetchTokenTransactions(true)
  }
}

const refreshData = async () => {
  await walletStore.fetchBalance()
  await walletStore.fetchTransactions()
  await walletStore.fetchTokenTransactions()
}

const onWalletChange = () => {
  if (!selectedWallet.value) return
  walletStore.selectWallet(selectedWallet.value)
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const selectWalletOption = async (wallet: Wallet) => {
  selectedWallet.value = wallet
  walletStore.selectWallet(wallet)
  dropdownOpen.value = false
  
  // Load data for the selected wallet
  await walletStore.fetchBalance()
  if (transactionType.value === 'native') {
    await walletStore.fetchTransactions()
  } else {
    await walletStore.fetchTokenTransactions()
  }
}

const addNewWallet = () => {
  dropdownOpen.value = false
  // Navigate to add wallet page
  window.location.href = '/add-wallet'
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.custom-wallet-selector')) {
    dropdownOpen.value = false
  }
}



const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatBalance = (balance: string) => {
  const num = parseFloat(balance)
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  return num.toFixed(6)
}

const getTransactionTypeLabel = (type: TransactionType) => {
  switch (type) {
    case 1: return 'Transfer'
    case 2: return 'Approve'
    case 3: return 'Contract'
    default: return 'Unknown'
  }
}

const getStatusLabel = (status: TransactionStatus) => {
  switch (status) {
    case 1: return 'Success'
    case 2: return 'Failed'
    default: return 'Unknown'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const getTransactionKey = (tx: TransactionItem | TokenTransferItem) => {
  return 'hash' in tx ? tx.hash : tx.transactionHash
}

const getTransactionHash = (tx: TransactionItem | TokenTransferItem) => {
  return 'hash' in tx ? tx.hash : tx.transactionHash
}

const getTransactionTimestamp = (tx: TransactionItem | TokenTransferItem) => {
  if ('hash' in tx) {
    // TransactionItem
    const rawTx = tx as TransactionItem
    return typeof rawTx.timestamp === 'string' ? parseInt(rawTx.timestamp, 16) : rawTx.timestamp
  } else {
    // TokenTransferItem
    const tokenTx = tx as TokenTransferItem
    return tokenTx.timestamp
  }
}

const getTransactionAmount = (tx: TransactionItem | TokenTransferItem) => {
  if ('value' in tx && 'tokenSymbol' in tx) {
    // TokenTransferItem
    const tokenTx = tx as TokenTransferItem
    return `${tokenTx.value} ${tokenTx.tokenSymbol}`
  } else if ('value' in tx) {
    // TransactionItem
    const rawTx = tx as TransactionItem
    const valueInEth = parseInt(rawTx.value, 16) / Math.pow(10, 18)
    return `${valueInEth.toFixed(6)} ETH`
  }
  return '0'
}

const getTransactionTypeDisplay = (tx: TransactionItem | TokenTransferItem) => {
  if ('tokenSymbol' in tx) {
    return 'Token Transfer'
  }
  return 'Transfer'
}

const getTransactionStatusDisplay = (tx: TransactionItem | TokenTransferItem) => {
  if ('status' in tx) {
    const status = typeof tx.status === 'string' ? parseInt(tx.status, 16) : tx.status
    return status === 1 ? 'Success' : 'Failed'
  }
  return 'Success' // TokenTransferItem doesn't have status, assume success
}

const getTransactionStatusClass = (tx: TransactionItem | TokenTransferItem) => {
  return getTransactionStatusDisplay(tx).toLowerCase()
}

watch(currentWallet, (newWallet) => {
  selectedWallet.value = newWallet
}, { immediate: true })

watch(activeTab, async (newTab) => {
  if (newTab === 'transactions') {
    transactionType.value = 'native'
    if (currentWallet.value && transactions.value.length === 0) {
      await walletStore.fetchTransactions()
    }
  }
})

watch(transactionType, async (newType) => {
  if (!currentWallet.value) return
  
  if (newType === 'native' && transactions.value.length === 0) {
    await walletStore.fetchTransactions()
  } else if (newType === 'token' && tokenTransactions.value.length === 0) {
    await walletStore.fetchTokenTransactions()
  }
})

onMounted(async () => {
  selectedWallet.value = currentWallet.value
  
  if (currentWallet.value) {
    console.log('Fetching balance for wallet:', currentWallet.value.address)
    await walletStore.fetchBalance()
    
    // Load initial transactions data
    if (transactionType.value === 'native') {
      await walletStore.fetchTransactions()
    } else {
      await walletStore.fetchTokenTransactions()
    }
  }
  
  // Add click outside listener for dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.wallet-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.no-wallet-state {
  text-align: center;
  padding: 60px 20px;
}

.welcome-message h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.welcome-message p {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.add-wallet-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.add-wallet-btn:hover {
  background: #2980b9;
}

.wallet-content {
  max-width: 600px;
  margin: 0 auto;
}

/* Wallet selector at top */
.wallet-selector-section {
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.custom-wallet-selector {
  position: relative;
  width: 100%;
}

.wallet-selector-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.wallet-selector-trigger:hover {
  background: #f8f9fa;
}

.selected-wallet {
  flex: 1;
}

.wallet-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.wallet-address {
  font-size: 14px;
  color: #7f8c8d;
  font-family: monospace;
  word-break: break-all;
}

.dropdown-arrow {
  font-size: 12px;
  color: #7f8c8d;
  transition: transform 0.2s;
  margin-left: 15px;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.wallet-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.wallet-option {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.wallet-option:last-child {
  border-bottom: none;
}

.wallet-option:hover {
  background: #f8f9fa;
}

.wallet-option.selected {
  background: #e3f2fd;
}

.wallet-option .wallet-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.wallet-option .wallet-address {
  font-size: 12px;
  color: #7f8c8d;
  font-family: monospace;
}

.add-wallet-option {
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.add-wallet-option:hover {
  background: #e3f2fd;
}

.add-wallet-text {
  font-size: 14px;
  font-weight: 500;
  color: #3498db;
  text-align: center;
}

/* Balance section */
.balance-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 30px;
}

.total-balance {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

/* Assets section */
.assets-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.section-title {
  margin: 0;
  padding: 20px 20px 0 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.assets-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.asset-item:hover {
  background: #e9ecef;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-icon, .token-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.token-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.asset-details {
  display: flex;
  flex-direction: column;
}

.asset-name, .token-name {
  font-weight: 500;
  color: #2c3e50;
}

.asset-symbol, .token-symbol {
  font-size: 14px;
  color: #7f8c8d;
}

.asset-balance {
  text-align: right;
}

.balance-amount {
  font-weight: 500;
  color: #2c3e50;
}

.balance-usd {
  font-size: 14px;
  color: #7f8c8d;
}

/* Transactions section */
.transactions-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.transaction-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 16px;
  color: #7f8c8d;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.tab-btn:hover {
  background: #f8f9fa;
}

.transactions-content {
  padding: 20px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.transaction-item:hover {
  background: #e9ecef;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-type {
  font-weight: 500;
  color: #2c3e50;
}

.tx-hash {
  font-family: monospace;
  font-size: 12px;
  color: #7f8c8d;
}

.tx-time {
  font-size: 12px;
  color: #95a5a6;
}

.tx-details {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-amount {
  font-weight: 500;
  color: #2c3e50;
}

.tx-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.tx-status.success {
  background: #d4edda;
  color: #155724;
}

.tx-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

.load-more-section {
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #eee;
  margin-top: 1rem;
}

.load-more-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.load-more-btn:hover:not(:disabled) {
  background: #0056b3;
}

.load-more-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>