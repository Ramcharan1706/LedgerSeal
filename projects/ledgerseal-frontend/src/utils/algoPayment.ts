import { useWallet } from '@txnlab/use-wallet-react';
import { useCallback, useState } from 'react';
import algosdk from 'algosdk';

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

type PaymentResult = {
  success: boolean;
  txId?: string;
  error?: string;
};

// ✅ FIXED: Handle both txId AND txid (lowercase)
function getTxId(response: any): string {
  console.log('getTxId input:', typeof response, response);

  if (typeof response === 'string') return response;
  if (Array.isArray(response)) {
    const first = response[0];
    return (first as any)?.txId || (first as any)?.txid || first || '';
  }

  // ✅ KEY FIX: lowercase txid + uppercase txId
  return (response as any).txId || (response as any).txid || '';
}

async function sendRawWithRetry(client: algosdk.Algodv2, signedTxns: Uint8Array[], maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.sendRawTransaction(signedTxns).do();
      console.log(`✅ SendRaw success (attempt ${attempt}):`, response);
      return response;
    } catch (err: any) {
      console.warn(`SendRaw attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}

export const useAlgoPayment = () => {
  const { activeAddress, signTransactions } = useWallet();

  const [loading, setLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const sendPayment = useCallback(
    async ({
      note,
      receiver,
      amount = 1000000,
      waitForConfirmation = false,
    }: {
      note: string;
      receiver?: string;
      amount?: number;
      waitForConfirmation?: boolean;
    }): Promise<PaymentResult> => {
      if (!activeAddress) {
        return { success: false, error: 'Wallet not connected' };
      }

      setLoading(true);

      try {
        const toAddress =
          receiver ??
          '2ZTFJNDXPWDETGJQQN33HAATRHXZMBWESKO2AUFZUHERH2H3TG4XTNPL4Y';

        const suggestedParams =
          await algodClient.getTransactionParams().do();

        const accountInfo =
          await algodClient.accountInformation(activeAddress).do();

        const balance = Number(accountInfo.amount);

        const minFee = Number(suggestedParams.minFee || 1000);
        const minRequired = Number(amount) + minFee * 2;

        const balanceALGO = balance / 1e6;

        if (balance < minRequired) {
          const minALGO = minRequired / 1e6;
          throw new Error(
            `Insufficient balance: ${balanceALGO.toFixed(
              3
            )} ALGO (need ~${minALGO.toFixed(3)})`
          );
        }

        console.log('Balance OK:', balanceALGO.toFixed(3), 'ALGO');

        if (!algosdk.isValidAddress(toAddress)) {
          throw new Error('Invalid receiver address');
        }

        const noteBytes = new TextEncoder().encode(note);

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: toAddress,
          amount: Number(amount),
          note: noteBytes,
          suggestedParams,
        });

        const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
        const signedTxnRaw = await signTransactions([encodedTxn]);

        const signedTxns = Array.isArray(signedTxnRaw)
          ? signedTxnRaw.filter(
              (t): t is Uint8Array => t !== null
            )
          : [signedTxnRaw as Uint8Array];

        if (!signedTxns.length) {
          throw new Error('No signed transaction');
        }

        const response = await sendRawWithRetry(algodClient, signedTxns);

        console.log('Raw sendRaw response:', JSON.stringify(response, null, 2));

        const txId = getTxId(response);

        if (!txId) {
          throw new Error(`No txId returned from network. Raw response: ${JSON.stringify(response)}`);
        }

        console.log('✅ Payment sent:', txId);

        if (waitForConfirmation) {
          (async () => {
            try {
              await algosdk.waitForConfirmation(
                algodClient,
                txId,
                20
              );
              console.log('✅ Confirmed:', txId);
            } catch {
              console.warn('Confirmation delayed:', txId);
            }
          })();
        }

        setLastTxId(txId);

        return { success: true, txId };
      } catch (err: any) {
        console.error('❌ Payment failed:', err);

        return {
          success: false,
          error: err.message || 'Transaction failed',
        };
      } finally {
        setLoading(false);
      }
    },
    [activeAddress, signTransactions]
  );

  return {
    sendPayment,
    loading,
    lastTxId,
  };
};
