import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Wallet, AssetInfo, TransactionItem, TokenTransferItem } from '@/types/wallet'
import { WalletAPI } from '@/services/api'

const STORAGE_KEY = 'simple-wallet-addresses'

export const useWalletStore = defineStore('wallet', () => {
  const wallets = ref<Wallet[]>([])
  const currentWallet = ref<Wallet | null>(null)
  const assets = ref<AssetInfo[]>([])
  const transactions = ref<TransactionItem[]>([])
  const tokenTransactions = ref<TokenTransferItem[]>([])
  const loading = ref(false)
  const transactionsLoading = ref(false)
  const tokenTransactionsLoading = ref(false)
  
  // Pagination state
  const transactionsCursor = ref<string | undefined>()
  const tokenTransactionsCursor = ref<string | undefined>()
  const hasMoreTransactions = ref(false)
  const hasMoreTokenTransactions = ref(false)

  const totalBalance = computed(() => {
    return assets.value.reduce((sum, asset) => {
      return sum + parseFloat(asset.balanceUsd || '0')
    }, 0).toFixed(2)
  })

  function loadWallets() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    
    try {
      wallets.value = JSON.parse(stored)
      if (wallets.value.length > 0 && !currentWallet.value) {
        currentWallet.value = wallets.value[0]
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
      wallets.value = []
    }
  }

  function saveWallets() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets.value))
  }

  function addWallet(address: string, name?: string): boolean {
    if (!isValidAddress(address)) {
      return false
    }

    const exists = wallets.value.some(w => w.address.toLowerCase() === address.toLowerCase())
    if (exists) {
      return false
    }

    const wallet: Wallet = {
      address: address.toLowerCase(),
      name: name || `Wallet ${wallets.value.length + 1}`,
      chainId: 3
    }

    wallets.value.push(wallet)
    saveWallets()
    
    // Always select the newly added wallet
    currentWallet.value = wallet
    
    return true
  }

  function removeWallet(address: string): boolean {
    const index = wallets.value.findIndex(w => w.address.toLowerCase() === address.toLowerCase())
    if (index === -1) {
      return false
    }

    wallets.value.splice(index, 1)
    saveWallets()
    
    if (currentWallet.value?.address.toLowerCase() === address.toLowerCase()) {
      currentWallet.value = wallets.value.length > 0 ? wallets.value[0] : null
    }
    
    return true
  }

  function selectWallet(wallet: Wallet) {
    currentWallet.value = wallet
    // Clear previous data
    assets.value = []
    transactions.value = []
    tokenTransactions.value = []
    // Reset pagination state
    transactionsCursor.value = undefined
    tokenTransactionsCursor.value = undefined
    hasMoreTransactions.value = false
    hasMoreTokenTransactions.value = false
  }

  async function fetchBalance() {
    if (!currentWallet.value) return
    
    loading.value = true
    try {
      assets.value = await WalletAPI.getBalance(currentWallet.value.address)
    } finally {
      loading.value = false
    }
  }

  async function fetchTransactions(loadMore = false) {
    if (!currentWallet.value) return
    
    transactionsLoading.value = true
    try {
      const cursor = loadMore ? transactionsCursor.value : undefined
      const result = await WalletAPI.getTransactions(currentWallet.value.address, cursor)
      
      if (loadMore) {
        transactions.value = [...transactions.value, ...result.transactions]
      } else {
        transactions.value = result.transactions
      }
      
      transactionsCursor.value = result.nextCursor
      hasMoreTransactions.value = result.hasMore
    } finally {
      transactionsLoading.value = false
    }
  }

  async function fetchTokenTransactions(loadMore = false) {
    if (!currentWallet.value) return
    
    tokenTransactionsLoading.value = true
    try {
      const cursor = loadMore ? tokenTransactionsCursor.value : undefined
      const result = await WalletAPI.getTokenTransactions(currentWallet.value.address, cursor)
      
      if (loadMore) {
        tokenTransactions.value = [...tokenTransactions.value, ...result.transfers]
      } else {
        tokenTransactions.value = result.transfers
      }
      
      tokenTransactionsCursor.value = result.nextCursor
      hasMoreTokenTransactions.value = result.hasMore
    } finally {
      tokenTransactionsLoading.value = false
    }
  }

  function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Initialize
  loadWallets()

  return {
    wallets,
    currentWallet,
    assets,
    transactions,
    tokenTransactions,
    loading,
    transactionsLoading,
    tokenTransactionsLoading,
    hasMoreTransactions,
    hasMoreTokenTransactions,
    totalBalance,
    addWallet,
    removeWallet,
    selectWallet,
    fetchBalance,
    fetchTransactions,
    fetchTokenTransactions,
    isValidAddress
  }
 })