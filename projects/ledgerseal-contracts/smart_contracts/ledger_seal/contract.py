from algopy import ARC4Contract, Account, Bytes, Global, Txn, UInt64, String, arc4, Box


class LedgerSeal(ARC4Contract):
    """LedgerSeal - Blockchain-based evidence management contract for Algorand"""

    def __init__(self) -> None:
        pass

    @arc4.abimethod
    def register_evidence(
        self,
        file_hash: Bytes,
        metadata_hash: Bytes,
        owner: Account
    ) -> bool:
        """Register new evidence with owner and metadata. Rejects duplicates."""
        evidence_box = Box(Account, key=file_hash)
        if evidence_box:
            return False
        
        evidence_box.value = owner
        
        # Store metadata existence flag
        metadata_box = Box(UInt64, key=metadata_hash)
        metadata_box.value = UInt64(1)
        
        return True

    @arc4.abimethod
    def get_owner(self, file_hash: Bytes) -> Account:
        """Get current owner of evidence"""
        evidence_box = Box(Account, key=file_hash)
        return evidence_box.value

    @arc4.abimethod
    def evidence_exists(self, file_hash: Bytes) -> bool:
        """Check if evidence is registered"""
        return bool(Box(Account, key=file_hash))

    @arc4.abimethod
    def update_metadata(
        self,
        file_hash: Bytes,
        metadata_hash: Bytes
    ) -> bool:
        """Update metadata hash. Only current owner can update."""
        evidence_box = Box(Account, key=file_hash)
        if not evidence_box:
            return False
        
        if Txn.sender != evidence_box.value:
            return False

        metadata_box = Box(UInt64, key=metadata_hash)
        metadata_box.value = UInt64(1)
        return True

    @arc4.abimethod
    def transfer_ownership(
        self,
        file_hash: Bytes,
        new_owner: Account
    ) -> bool:
        """Transfer ownership to another wallet. Only current owner can transfer."""
        evidence_box = Box(Account, key=file_hash)
        if not evidence_box:
            return False
        
        if Txn.sender != evidence_box.value:
            return False

        evidence_box.value = new_owner
        return True

    @arc4.abimethod
    def metadata_exists(self, metadata_hash: Bytes) -> bool:
        """Check if metadata exists"""
        return bool(Box(UInt64, key=metadata_hash))

    @arc4.abimethod
    def get_timestamp(self, file_hash: Bytes) -> UInt64:
        """Get evidence exists check"""
        evidence_box = Box(Account, key=file_hash)
        return UInt64(1) if evidence_box else UInt64(0)

    @arc4.abimethod
    def get_last_transfer(self, file_hash: Bytes) -> UInt64:
        """Get last transfer check"""
        evidence_box = Box(Account, key=file_hash)
        return UInt64(1) if evidence_box else UInt64(0)

    @arc4.abimethod
    def delete_evidence(self, file_hash: Bytes) -> bool:
        """Delete evidence. Only app creator allowed."""
        if Txn.sender != Global.creator_address:
            return False

        evidence_box = Box(Account, key=file_hash)
        if not evidence_box:
            return False

        del evidence_box.value
        return True

    @arc4.abimethod
    def verify_evidence(self, file_hash: Bytes) -> bool:
        """Verify if evidence exists and is valid"""
        return bool(Box(Account, key=file_hash))

    @arc4.abimethod
    def add_log(
        self,
        file_hash: Bytes,
        note: String
    ) -> bool:
        """Store log entry for chain-of-custody tracking"""
        evidence_box = Box(Account, key=file_hash)
        if not evidence_box:
            return False

        log_key = file_hash + Bytes(b"_log")
        log_box = Box(String, key=log_key)
        log_box.value = note
        return True
