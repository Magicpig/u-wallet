<template>
  <div class="add-wallet-view">
    <div class="header">
      <h1>Add Wallet</h1>
      <router-link to="/" class="back-btn">← Back</router-link>
    </div>

    <div class="add-wallet-form">
      <div class="form-group">
        <label for="address">Wallet Address</label>
        <input
          id="address"
          v-model="address"
          type="text"
          placeholder="0x..."
          class="address-input"
          :class="{ error: addressError }"
        >
        <div v-if="addressError" class="error-message">{{ addressError }}</div>
      </div>

      <div class="form-group">
        <label for="name">Wallet Name (Optional)</label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="My Wallet"
          class="name-input"
        >
      </div>

      <div class="form-actions">
        <button @click="addWallet" :disabled="!address || loading" class="add-btn">
          {{ loading ? 'Adding...' : 'Add Wallet' }}
        </button>
        <button @click="clearForm" class="clear-btn">Clear</button>
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>

    <div class="existing-wallets" v-if="wallets.length > 0">
      <h3>Existing Wallets</h3>
      <div class="wallet-list">
        <div v-for="wallet in wallets" :key="wallet.address" class="wallet-item">
          <div class="wallet-info">
            <div class="wallet-name">{{ wallet.name }}</div>
            <div class="wallet-address">{{ formatAddress(wallet.address) }}</div>
          </div>
          <button @click="removeWallet(wallet.address)" class="remove-btn">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const walletStore = useWalletStore()

const address = ref('')
const name = ref('')
const addressError = ref('')
const successMessage = ref('')
const loading = ref(false)

const { wallets } = walletStore

const validateAddress = (addr: string): boolean => {
  if (!addr) {
    addressError.value = 'Address is required'
    return false
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    addressError.value = 'Invalid Ethereum address format'
    return false
  }
  
  const exists = wallets.some(w => w.address.toLowerCase() === addr.toLowerCase())
  if (exists) {
    addressError.value = 'This wallet address already exists'
    return false
  }
  
  addressError.value = ''
  return true
}

const addWallet = async () => {
  if (!validateAddress(address.value)) {
    return
  }
  
  loading.value = true
  successMessage.value = ''
  
  try {
    const success = walletStore.addWallet(address.value, name.value || undefined)
    
    if (success) {
      successMessage.value = 'Wallet added successfully!'
      clearForm()
      
      // Redirect to wallet view after 1.5 seconds
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      addressError.value = 'Failed to add wallet'
    }
  } catch (error) {
    console.error('Error adding wallet:', error)
    addressError.value = 'An error occurred while adding the wallet'
  } finally {
    loading.value = false
  }
}

const clearForm = () => {
  address.value = ''
  name.value = ''
  addressError.value = ''
  successMessage.value = ''
}

const removeWallet = (walletAddress: string) => {
  if (confirm('Are you sure you want to remove this wallet?')) {
    walletStore.removeWallet(walletAddress)
  }
}

const formatAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
</script>

<style scoped>
.add-wallet-view {
  max-width: 600px;
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

.add-wallet-form {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.address-input,
.name-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: monospace;
}

.address-input.error {
  border-color: #e74c3c;
}

.name-input {
  font-family: inherit;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
}

.success-message {
  color: #27ae60;
  font-size: 14px;
  margin-top: 15px;
  padding: 10px;
  background: #d4edda;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.add-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
}

.add-btn:hover:not(:disabled) {
  background: #2980b9;
}

.add-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.clear-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.clear-btn:hover {
  background: #7f8c8d;
}

.existing-wallets h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.wallet-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.wallet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: white;
}

.wallet-item:last-child {
  border-bottom: none;
}

.wallet-info .wallet-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c3e50;
}

.wallet-info .wallet-address {
  font-family: monospace;
  color: #7f8c8d;
  font-size: 14px;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: #c0392b;
}
</style>