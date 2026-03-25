# ChainProof Backend - Transaction Verification Mode ✅

**NO BACKEND_MNEMONIC REQUIRED** - Frontend sends transactions, backend verifies.

## Setup

```bash
npm install
docker run -d -p 4001:4001 algorand/algod:latest  # Local TestNet node
npm run dev
```

**Config (.env optional):**
```
ALGOD_SERVER=http://localhost:4001
ALGOD_TOKEN=
```

## New Flow (Frontend)

1. **Frontend computes** SHA256 hash of file
2. **Send txn**: 1 ALGO self-payment, `note = \`ledgerseal:register:${hash}\``
3. **Wait confirmed**
4. **POST** `/api/evidence/register` multipart:
   ```
   file: <fileBuffer>
   txnId: <txn.txId>
   owner: <wallet.address>
   metadata: <JSON.stringify(metadata)>
   ```

Backend verifies txn matches hash/sender/amount/note → stores.

**Transfer**: Similar, note=`ledgerseal:transfer:${hash}`, POST `/api/evidence/:id/transfer {txnId, newOwner}`

## API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/evidence` | - | List evidence |
| GET | `/api/evidence/:id` | - | Get evidence |
| POST | `/api/evidence/register` | `file`, `txnId`, `owner`, `metadata` | **Register + Verify** |
| POST | `/api/evidence/verify` | `id`, `file?`, `metadata?` | Tamper detection |
| GET | `/api/evidence/:id/certificate` | - | PDF Certificate |
| POST | `/api/evidence/:id/transfer` | `txnId`, `newOwner` | Transfer ownership |
| GET | `/api/evidence/:id/history` | - | Chain of custody |
| GET | `/api/evidence/logs` | - | Verification logs |

## Error Handling

- Global `unhandledRejection` / `uncaughtException`
- Express error middleware
- Graceful JSON errors, no crashes

## Local Testing

```bash
# Backend
npm run dev

# Frontend sends txn first (via Pera/TxnLab), then curl
curl -X POST http://localhost:3001/api/evidence/register \
  -F "file=@document.pdf" \
  -F "txnId=ABC123..." \
  -F "owner=GABCX..." \
  -F "metadata={\"type\":\"contract\"}"
```

**DB**: `./chainproof.db` (SQLite)

🚀 Ready for production!


