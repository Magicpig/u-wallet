// Wallet types based on proto definitions
export interface AssetInfo {
  blockchain: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  tokenType: TokenType
  contractAddress?: string
  holderAddress: string
  balance: string
  balanceRawInteger: string
  balanceUsd: string
  tokenPrice: string
  thumbnail: string
}

// Raw transaction item from blockchain
export interface TransactionItem {
  hash: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  gasUsed: string
  nonce: string
  blockNumber: string
  blockHash: string
  transactionIndex: string
  type: string
  status: string
  input: string
  timestamp: string
  blockchain: string
  cumulativeGasUsed: string
  v: string
  r: string
  s: string
}

// Token transfer item
export interface TokenTransferItem {
  fromAddress: string
  toAddress: string
  contractAddress: string
  value: string
  valueRawInteger: string
  blockchain: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: number
  thumbnail?: string
  transactionHash: string
  blockHeight: number
  timestamp: number
}

export const TokenType = {
  UNSPECIFIED: 0,
  NATIVE: 1,
  ERC20: 2,
  ERC721: 3,
  ERC1155: 4
} as const

export const TransactionType = {
  UNSPECIFIED: 0,
  TRANSFER: 1,
  APPROVE: 2,
  CONTRACT_INTERACTION: 3
} as const

export const TransactionStatus = {
  UNSPECIFIED: 0,
  SUCCESS: 1,
  FAILED: 2
} as const

export type TokenType = typeof TokenType[keyof typeof TokenType]
export type TransactionType = typeof TransactionType[keyof typeof TransactionType]
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus]

export interface Wallet {
  address: string
  name: string
  chainId: number
}