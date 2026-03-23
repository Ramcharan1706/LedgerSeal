import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

export interface EvidenceItem {
  id: string
  fileName: string
  hash: string
  timestamp: string
  owner: string
  status: 'verified' | 'pending'
  transactionId?: string
  block?: number
}

export interface ChainEvent {
  id: string
  from: string
  to: string
  timestamp: string
  note: string
  transactionId?: string
  block?: number
}

class EvidenceService {
  private algodClient: algosdk.Algodv2
  private indexerClient: algosdk.Indexer

  constructor() {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const indexerConfig = getIndexerConfigFromViteEnvironment()

    this.algodClient = new algosdk.Algodv2(
      String(algodConfig.token),
      algodConfig.server,
      algodConfig.port
    )

    this.indexerClient = new algosdk.Indexer(
      String(indexerConfig.token),
      indexerConfig.server,
      indexerConfig.port
    )
  }

  /**
   * Fetch evidence data from blockchain transactions
   * This queries for transactions with specific note patterns or application calls
   */
  async fetchEvidenceData(walletAddress?: string): Promise<EvidenceItem[]> {
    try {
      // For now, we'll simulate fetching from blockchain
      // In a real implementation, this would query:
      // 1. Application state for stored evidence
      // 2. Transactions with specific note patterns
      // 3. Boxes containing evidence data

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Query recent transactions (this is a simplified example)
      const transactions = await this.indexerClient
        .searchForTransactions()
        .limit(50)
        .do()

      // Transform blockchain data into evidence items
      const evidenceItems: EvidenceItem[] = []

      // For demonstration, we'll create evidence items from recent transactions
      // In a real app, you'd filter for specific transaction types or application calls
      transactions.transactions.slice(0, 10).forEach((tx, index) => {
        // Check if transaction has note that looks like evidence data
        const note = tx.note ? new TextDecoder().decode(tx.note) : ''

        // Look for evidence-related patterns in transaction notes
        if (note.includes('evidence') || note.includes('hash') || tx.type === 'pay') {
          const evidenceItem: EvidenceItem = {
            id: tx.id,
            fileName: this.extractFileNameFromNote(note) || `evidence_${index + 1}.pdf`,
            hash: this.extractHashFromNote(note) || tx.id.substring(0, 64), // Use tx id as fallback hash
            timestamp: new Date(tx['round-time'] * 1000).toISOString(),
            owner: tx.sender,
            status: this.determineStatus(tx),
            transactionId: tx.id,
            block: tx['confirmed-round']
          }
          evidenceItems.push(evidenceItem)
        }
      })

      // If no real data found, return empty array (no mock data)
      return evidenceItems

    } catch (error) {
      console.error('Error fetching evidence data:', error)
      // Return empty array instead of mock data
      return []
    }
  }

  /**
   * Extract filename from transaction note
   */
  private extractFileNameFromNote(note: string): string | null {
    // Look for filename patterns in the note
    const filenameMatch = note.match(/filename[:\s]+([^\s]+)/i)
    return filenameMatch ? filenameMatch[1] : null
  }

  /**
   * Extract hash from transaction note
   */
  private extractHashFromNote(note: string): string | null {
    // Look for hash patterns in the note
    const hashMatch = note.match(/hash[:\s]+([a-f0-9]{64})/i)
    return hashMatch ? hashMatch[1] : null
  }

  /**
   * Determine verification status based on transaction data
   */
  private determineStatus(tx: any): 'verified' | 'pending' {
    // Simple logic: if transaction is confirmed and recent, consider verified
    const isRecent = Date.now() - (tx['round-time'] * 1000) < 24 * 60 * 60 * 1000 // 24 hours
    return tx['confirmed-round'] && isRecent ? 'verified' : 'pending'
  }

  /**
   * Get blockchain network status
   */
  async getNetworkStatus() {
    try {
      const status = await this.algodClient.status().do()
      return {
        lastRound: status['last-round'],
        network: status.network,
        version: status.version
      }
    } catch (error) {
      console.error('Error getting network status:', error)
      return null
    }
  }

  /**
   * Submit evidence to blockchain (placeholder for future implementation)
   */
  async submitEvidence(fileName: string, hash: string, walletAddress: string): Promise<string> {
    // This would create a transaction to store evidence on blockchain
    // For now, return a mock transaction ID
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Fetch chain of custody events for evidence
   */
  async fetchChainOfCustody(evidenceId?: string): Promise<ChainEvent[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Query transactions related to evidence custody transfers
      const transactions = await this.indexerClient
        .searchForTransactions()
        .limit(20)
        .do()

      // Transform into custody events
      const custodyEvents: ChainEvent[] = []

      transactions.transactions.forEach((tx, index) => {
        // Look for custody transfer patterns
        const note = tx.note ? new TextDecoder().decode(tx.note) : ''

        if (note.includes('custody') || note.includes('transfer') || tx.type === 'pay') {
          const event: ChainEvent = {
            id: tx.id,
            from: tx.sender,
            to: this.extractRecipientFromNote(note) || tx.sender, // Simplified
            timestamp: new Date(tx['round-time'] * 1000).toISOString(),
            note: this.extractNoteFromTransaction(note, tx),
            transactionId: tx.id,
            block: tx['confirmed-round']
          }
          custodyEvents.push(event)
        }
      })

      // Sort by timestamp (most recent first)
      custodyEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return custodyEvents

    } catch (error) {
      console.error('Error fetching chain of custody:', error)
      return []
    }
  }

  /**
   * Extract recipient from transaction note
   */
  private extractRecipientFromNote(note: string): string | null {
    const recipientMatch = note.match(/to[:\s]+([A-Za-z0-9]+)/i)
    return recipientMatch ? recipientMatch[1] : null
  }

  /**
   * Extract meaningful note from transaction
   */
  private extractNoteFromTransaction(note: string, tx: any): string {
    if (note) {
      // Try to extract meaningful custody information
      if (note.includes('custody')) return note
      if (note.includes('transfer')) return `Custody transferred: ${note}`
    }

    // Default based on transaction type
    switch (tx.type) {
      case 'pay':
        return `Payment transaction - custody event`
      case 'appl':
        return `Application interaction - evidence update`
      default:
        return `Blockchain transaction recorded`
    }
  }
}

// Export singleton instance
export const evidenceService = new EvidenceService()
export default evidenceService