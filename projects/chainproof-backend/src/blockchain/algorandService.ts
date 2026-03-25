import algosdk from 'algosdk';

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = '';
const INDEXER_SERVER = 'https://testnet-api.algonode.cloud';

const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, '');
const indexer = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, '');

export class BlockchainService {
  static async verifyRegistrationTxn(txnId: string, expectedSender: string, expectedHash: string): Promise<boolean> {
    try {
      const txnInfo = await indexer.lookupTransactionByID(txnId).do();
      const txn = txnInfo.transactions[0];
      if (!txn || !txn['confirmed-round']) {
        console.log(`Txn ${txnId} not confirmed`);
        return false;
      }

      const paymentTxn = txn.txn.txn;
      if (paymentTxn.type !== 'pay') {
        console.log(`Not payment txn: ${paymentTxn.type}`);
        return false;
      }

      if (paymentTxn.sender !== expectedSender) {
        console.log(`Sender mismatch: ${paymentTxn.sender} != ${expectedSender}`);
        return false;
      }

      if (paymentTxn.amt !== 1000000) {
        console.log(`Amount mismatch: ${paymentTxn.amt} != 1000000`);
        return false;
      }

      let noteStr = '';
      if (paymentTxn.note && paymentTxn.note.length > 0) {
        try {
          noteStr = Buffer.from(paymentTxn.note, 'base64').toString('utf8');
        } catch {
          console.log(`Invalid note encoding`);
          return false;
        }
      }

      if (!noteStr.startsWith(`ledgerseal:register:${expectedHash}`)) {
        console.log(`Note mismatch: "${noteStr}" != "ledgerseal:register:${expectedHash}"`);
        return false;
      }

      console.log(`✅ Txn ${txnId} verified for ${expectedSender}`);
      return true;
    } catch (error) {
      console.error(`Verification failed for ${txnId}:`, error);
      return false;
    }
  }

  static async verifyTransferTxn(txnId: string, expectedFrom: string, expectedTo: string, evidenceHash: string): Promise<boolean> {
    try {
      console.log(`[BlockchainService] Verifying transfer txn ${txnId} (from ${expectedFrom} to ${expectedTo}, hash ${evidenceHash}`);

      let attempts = 0;
      const maxAttempts = 30;
      let txnInfo;
      let txn;
      while (attempts < maxAttempts) {
        txnInfo = await indexer.lookupTransactionByID(txnId).do();
        txn = txnInfo.transactions[0];
        if (txn && txn['confirmed-round']) {
          console.log(`Txn ${txnId} confirmed after ${attempts + 1} attempts`);
          break;
        }
        console.log(`Waiting for ${txnId} confirmation... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      if (!txn || !txn['confirmed-round']) {
        console.log(`Txn ${txnId} not confirmed after ${maxAttempts}s`);
        return false;
      }

      const paymentTxn = txn.txn.txn;
      console.log(`Type: ${paymentTxn.type}, sender: ${paymentTxn.sender}, receiver: ${paymentTxn.receiver}, amount: ${paymentTxn.amt}`);

      if (paymentTxn.type !== 'pay') {
        console.log(`Not payment txn: ${paymentTxn.type}`);
        return false;
      }
      if (paymentTxn.sender !== expectedFrom) {
        console.log(`Sender mismatch: ${paymentTxn.sender} != ${expectedFrom}`);
        return false;
      }
      if (paymentTxn.receiver !== expectedTo) {
        console.log(`Receiver mismatch: ${paymentTxn.receiver} != ${expectedTo}`);
        return false;
      }
      if (paymentTxn.amt !== 1000000) {
        console.log(`Amount mismatch: ${paymentTxn.amt} != 1000000`);
        return false;
      }

      let noteStr = '';
      if (paymentTxn.note && paymentTxn.note.length > 0) {
        try {
          noteStr = Buffer.from(paymentTxn.note, 'base64').toString('utf8');
        } catch (e) {
          console.log(`Note decode error:`, e);
          return false;
        }
        console.log(`Note: ${noteStr}`);
      } else {
        console.log('No note in txn');
        return false;
      }

      if (!noteStr.startsWith('ledgerseal:transfer:')) {
        console.log(`Note prefix mismatch: ${noteStr}`);
        return false;
      }

      const parts = noteStr.split(':');
      if (parts.length < 3) {
        console.log(`Note format error: ${noteStr} (expected ledgerseal:transfer:evidenceId:newOwner)`);
        return false;
      }
      console.log(`Note OK: evidenceId="${parts[2]}" (hash=${evidenceHash.slice(0,16)}...)`);

      console.log(`✅ Transfer verified: ${txnId}`);
      return true;
    } catch (error) {
      console.error(`Transfer verification ERROR ${txnId}:`, error);
      return false;
    }
  }

  static async getOwner(txnId: string): Promise<string | null> {
    try {
      const txnInfo = await indexer.lookupTransactionByID(txnId).do();
      const txn = txnInfo.transactions[0];
      if (txn && txn['confirmed-round'] && txn.txn.txn) {
        return txn.txn.txn.sender;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async getCustodyChain(evidenceHash: string) {
    return [];
  }
}

