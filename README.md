# ChainProof+: Forensic-Grade Blockchain-Based Digital Evidence Integrity System

A comprehensive, enterprise-ready solution for managing digital evidence with blockchain-based integrity verification, wallet-authenticated ownership transfers, and tamper detection. Built on Algorand with real-time verification, role-based access control (RBAC), and decentralized storage options.

---

## 🎯 Project Overview

**ChainProof+** is a complete forensic evidence management system that leverages blockchain technology to ensure:
- **Immutable records** of evidence ownership and custody chain
- **Cryptographic verification** of file integrity (SHA-256 + BLAKE2b hashing)
- **Tokenized ownership** via Algorand Standard Assets (ASA)
- **Wallet-based authentication** with Pera Wallet for transaction signing
- **Role-based access control** (Admin, Investigator, Auditor)
- **Smart contract enforcement** of access policies and multi-signature approvals
- **AI-enhanced verification** for tampering detection and deepfake risk assessment
- **Decentralized architecture** with optional IPFS integration for file storage

---

## ✨ Key Features

### 🔐 Security & Integrity
- **Dual-hash verification**: SHA-256 and BLAKE2b hashing for evidence integrity
- **Transaction-based proof**: Every transfer recorded on Algorand blockchain
- **Tamper detection**: AI heuristics to identify potential file manipulation
- **Access control**: RBAC system restricting evidence operations to authorized roles

### 💼 Ownership & Custody
- **ASA tokenization**: Each evidence file represented as a unique Algorand token
- **Real-time transfers**: Pera Wallet-approved asset transfers with blockchain recording
- **Ownership timeline**: Visual history of all custody changes with timestamps
- **Multi-signature approval**: Optional 2-3 signature requirements for critical evidence
- **Transaction notes**: Evidence metadata embedded in blockchain for full traceability

### 📊 Verification & Audit
- **Trust scoring**: Automated verification scoring (0-100%) based on integrity + metadata + chain validation
- **Verification logs**: Complete audit trail of all verification operations
- **QR certificates**: Downloadable forensic certificates with blockchain verification links
- **Chain of custody tracking**: Immutable record of evidence movement between stakeholders

### 🎨 User Experience
- **Drag-and-drop upload**: Seamless evidence file ingestion
- **Visual timeline**: Graph-based ownership and custody history
- **Real-time dashboard**: Live transaction status and blockchain updates
- **Downloadable reports**: PDF forensic certificates with QR codes linking to on-chain proof
- **Responsive design**: Works on desktop and tablet for field operations

### 🌐 Integration & Scalability
- **IPFS support** (optional): Decentralized file storage while maintaining on-chain hash references
- **Public read access**: Evidence list and details publicly queryable; write operations require authentication
- **JWT token-based auth**: Session management with role-based permissions
- **Rate limiting**: API protection against abuse (100 requests/15 minutes)

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **TypeScript** — Type-safe backend development
- **SQLite** — Local database for evidence metadata
- **Algorand SDK** — Blockchain integration for ASA creation and transactions
- **jsonwebtoken (JWT)** — Authentication and authorization
- **Multer** — File upload handling
- **pdf-lib** — PDF certificate generation
- **qrcode** — QR code generation for blockchain proof links
- **cors**, **helmet**, **morgan**, **express-rate-limit** — Security & monitoring

### Frontend
- **React 18** + **TypeScript** — UI framework
- **Vite** — Lightning-fast dev server and build
- **Tailwind CSS** — Utility-first styling
- **use-wallet-react** — Pera Wallet integration
- **React Router** — Client-side navigation
- **@tanstack/react-query** — Server state management
- **notistack** — Toast notifications
- **@heroicons/react** — Icon library
- **AlgoKit Utils** — Algorand client utilities

### Smart Contracts
- **Python/PyTeal (AlgoPy)** — Algorand smart contract language
- **AlgoKit** — Development framework and deployment

### Infrastructure
- **Algorand TestNet** — Blockchain network (configurable for MainNet)
- **Docker** (optional) — Containerization support

---

## 📦 Project Structure

```
ledgerseal/
├── projects/
│   ├── chainproof-backend/          # Express API server
│   │   ├── src/
│   │   │   ├── blockchain/          # Algorand integration
│   │   │   ├── services/            # Business logic
│   │   │   ├── controllers/         # API endpoints
│   │   │   ├── routes/              # Route definitions
│   │   │   ├── middleware/          # Auth & RBAC
│   │   │   ├── verification/        # Verification engine
│   │   │   ├── utils/               # Hashing & utilities
│   │   │   └── config/              # Database setup
│   │   └── package.json
│   │
│   ├── ledgerseal-frontend/         # React web app
│   │   ├── src/
│   │   │   ├── pages/               # Page components
│   │   │   ├── components/          # Reusable components
│   │   │   ├── services/            # API client
│   │   │   └── utils/               # Helpers
│   │   └── package.json
│   │
│   └── ledgerseal-contracts/        # Smart contracts
│       ├── smart_contracts/
│       │   └── ledger_seal/
│       │       ├── contract.py      # RBAC contract
│       │       └── deploy_config.py
│       └── pyproject.toml
│
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v20+ and **npm** v9+
- **Python** 3.10+ (for smart contracts)
- **AlgoKit** CLI ([install guide](https://github.com/algorandfoundation/algokit-cli#install))
- **Pera Wallet** extension (for transaction signing)

### Quick Start

#### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd ledgerseal

# Install backend dependencies
cd projects/chainproof-backend
npm install

# Install frontend dependencies
cd ../ledgerseal-frontend
npm install

# Install contract dependencies (optional)
cd ../ledgerseal-contracts
pip install -r requirements.txt  # or poetry install
```

#### 2. Configure Environment

Create `.env` file in `projects/chainproof-backend/` with the following variables:

- `ALGOD_SERVER`, `ALGOD_PORT`, `ALGOD_TOKEN` — Algorand node connection (use PureStake or LocalNet)
- `INDEXER_SERVER`, `INDEXER_PORT`, `INDEXER_TOKEN` — Algorand indexer endpoint
- `DEPLOYER_MNEMONIC` — 25-word seed phrase for smart contract deployment
- `JWT_SECRET` — Secret key for JWT token signing (use a strong random string)
- `USE_IPFS` (optional) — Set to `true` to enable IPFS file storage
- `IPFS_API_URL` (optional) — IPFS node endpoint (default: Infura gateway)
- `VITE_API_BASE_URL` — Frontend API base URL (default: `http://localhost:3001/api`)

See `.env.example` for reference structure.

#### 3. Start Development Servers

**Backend** (from `projects/chainproof-backend/`):
```bash
npm run dev
# Runs on http://localhost:3001
```

**Frontend** (from `projects/ledgerseal-frontend/`):
```bash
npm run dev
# Runs on http://localhost:5173
```

#### 4. Test the Application

1. Open `http://localhost:5173` in your browser
2. Click wallet icon → Connect with Pera Wallet
3. Go to **Settings** → Select role → **Login with Wallet Role**
4. Navigate to **Upload** → Upload evidence file
5. View on **Dashboard** → Click evidence card → See **Ownership Timeline**
6. Try **Transfer Ownership** → Approve in Pera Wallet → Verify on-chain

---

## 🔑 Core Workflows

### Evidence Registration
1. User uploads file via drag-and-drop
2. Backend computes SHA-256 + BLAKE2b hashes
3. Algorand creates ASA token (1 unit, non-divisible)
4. Transaction recorded with evidence metadata in note field
5. Evidence stored in database with asset ID reference

### Ownership Transfer
1. User selects evidence and new owner address
2. Frontend constructs ASA transfer transaction
3. Pera Wallet prompts for approval and signature
4. Backend verifies transaction on-chain
5. Custody record created with transaction ID
6. Evidence ownership updated in database

### Verification
1. User provides evidence ID and optional file
2. Backend recomputes hashes if file provided
3. AI heuristics analyze for deepfake/tampering risk
4. Trust score calculated (0-100%)
5. Verification result stored with risk level
6. User can download forensic certificate with QR code

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` — Login with wallet address & role → receive JWT token

### Evidence (Public Read)
- `GET /api/evidence` — List all evidence
- `GET /api/evidence/:id` — Get evidence details
- `GET /api/evidence/:id/history` — Get ownership timeline
- `GET /api/evidence/:id/certificate` — Download forensic PDF

### Evidence (Protected Write)
- `POST /api/evidence/register` — Upload & register new evidence (Investigator+)
- `POST /api/evidence/verify` — Verify evidence integrity (Investigator+)
- `POST /api/evidence/:id/transfer` — Initiate ownership transfer (Investigator+)
- `POST /api/evidence/:id/transfer/approve` — Approve multi-sig transfer (Admin/Investigator)

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Upload | Verify | Transfer | Approve |
|------|--------|--------|----------|---------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Investigator** | ✅ | ✅ | ✅ | ✅ |
| **Auditor** | ❌ | ✅ | ❌ | ❌ |

---

## 🚀 Future Scope

### Planned Enhancements
- **Mobile Application** — Native iOS/Android app using React Native for field evidence collection with offline support
- **Advanced AI Integration** — Integrate leading AI models for facial recognition, forgery detection, and metadata analysis
- **Distributed Evidence Network** — Multi-node blockchain deployment for enhanced redundancy and geographic resilience
- **Regulatory Compliance Modules** — Support for GDPR, HIPAA, and jurisdiction-specific evidence handling standards
- **Automated Chain-of-Custody Reporting** — Generate compliant forensic reports with automated notifications
- **Evidence Encryption at Rest** — AES-256 encryption for stored evidence with key management services
- **Integration with Law Enforcement Systems** — Direct API integration with major law enforcement databases and case management systems
- **Advanced Analytics Dashboard** — Trends, anomaly detection, and predictive analysis for evidence patterns
- **Blockchain Explorer UI** — Custom explorer for easy transaction verification and audit trails
- **Multi-Chain Support** — Extend blockchain support to Ethereum, Polygon, and other networks for institutional choice

---

## 📚 Project Documentation

For detailed information, refer to:
- [Smart Contracts](projects/ledgerseal-contracts/README.md)
- [Frontend](projects/ledgerseal-frontend/README.md)

---

## 🤝 Contributing & Support

This is a production-ready forensic evidence management system. For issues, feature requests, or contributions, please follow the standard Git workflow.

---

## 📄 License

Proprietary — ChainProof+ Evidence Management System

---

## 🎯 Next Steps

1. Deploy smart contracts to Algorand TestNet/MainNet
2. Set up production Algorand API endpoints
3. Configure IPFS for decentralized file storage
4. Integrate advanced AI tampering detection APIs
5. Deploy frontend to web hosting
6. Conduct security audit for production use
