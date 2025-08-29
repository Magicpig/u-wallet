import type { AssetInfo, TransactionItem, TokenTransferItem } from '@/types/wallet'

const API_BASE = 'http://localhost:4002'
const OP_CHAIN_ID = 3; // Optimism chain ID

export class WalletAPI {
  static async getBalance(address: string): Promise<AssetInfo[]> {
    try {
      console.log('Fetching balance for address:', address)
      const response = await fetch(`${API_BASE}/grpc/WalletBalanceService/GetBalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemChainId: OP_CHAIN_ID,
          address: address
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API Response:', JSON.stringify(data, null, 2))
      
      // Handle nested response structure: { code: 0, data: { code: 0, message: "Success", result: { assets: [...] } } }
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`)
      }
      
      if (!data.data || data.data.code !== 0) {
        throw new Error(`API data error: ${data.data?.message || 'Unknown error'}`)
      }
      
      const assets = data.data.result?.assets || []
      console.log('Extracted assets:', assets)
      return assets
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      return []
    }
  }

  static async getTransactions(address: string, cursor?: string): Promise<{ transactions: TransactionItem[], hasMore: boolean, nextCursor?: string }> {
    try {
      const requestBody: any = {
        systemChainId: OP_CHAIN_ID,
        address: address,
        limit: 5
      }
      
      if (cursor) {
        requestBody.cursor = cursor
      }
      
      const response = await fetch(`${API_BASE}/grpc/WalletTransactionService/GetRawTransactionHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`)
      }
      
      if (!data.data || data.data.code !== 0) {
        throw new Error(`API data error: ${data.data?.message || 'Unknown error'}`)
      }
      
      const result = data.data.result || {}
      const transactions = result.transactions || []
      const nextPageToken = result.nextPageToken
      
      return {
        transactions,
        hasMore: !!nextPageToken,
        nextCursor: nextPageToken
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      return { transactions: [], hasMore: false }
    }
  }

  static async getTokenTransactions(address: string, cursor?: string): Promise<{ transfers: TokenTransferItem[], hasMore: boolean, nextCursor?: string }> {
    try {
      const requestBody: any = {
        systemChainId: OP_CHAIN_ID,
        address: address,
        limit: 5
      }
      
      if (cursor) {
        requestBody.cursor = cursor
      }
      
      const response = await fetch(`${API_BASE}/grpc/WalletTransactionService/GetTokenTransferHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`)
      }
      
      if (!data.data || data.data.code !== 0) {
        throw new Error(`API data error: ${data.data?.message || 'Unknown error'}`)
      }
      
      const result = data.data.result || {}
      const transfers = result.transfers || []
      const nextPageToken = result.nextPageToken
      
      return {
        transfers,
        hasMore: !!nextPageToken,
        nextCursor: nextPageToken
      }
    } catch (error) {
      console.error('Failed to fetch token transactions:', error)
      return { transfers: [], hasMore: false }
    }
  }

  static async getSupportedCurrencies() {
    try {
      const response = await fetch(`${API_BASE}/grpc/WalletCurrencyService/GetSupportedCurrencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemChainId: OP_CHAIN_ID
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`)
      }
      
      if (!data.data || data.data.code !== 0) {
        throw new Error(`API data error: ${data.data?.message || 'Unknown error'}`)
      }
      
      return data.data.result?.currencies || []
    } catch (error) {
      console.error('Failed to fetch supported currencies:', error)
      return []
    }
  }
}