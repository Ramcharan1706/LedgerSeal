from algopy import ARC4Contract, Bytes, Address, bool, UInt64
from algopy.arc4 import abimethod
from algopy.global_state import GlobalState
from algopy.local_state import LocalState

class LedgerSeal(ARC4Contract):
    @abimethod()
    def register_evidence(self, file_hash: Bytes, metadata_hash: Bytes, owner: Address) -> bool:
        """Register new evidence hash with owner. Reject duplicates."""
        assert not GlobalState.key(file_hash).exists()
        GlobalState.key(file_hash).set(owner)
        GlobalState.key(metadata_hash).set(UInt64(1))  # Flag existence
        return True

    @abimethod()
    def get_owner(self, file_hash: Bytes) -> Address:
        """Get current owner of evidence."""
        return GlobalState.key(file_hash).get()

    @abimethod()
    def transfer_ownership(self, file_hash: Bytes, new_owner: Address) -> bool:
        """Transfer only by current owner."""
        current_owner: Address = GlobalState.key(file_hash).get()
        assert self.txn.sender == current_owner
        GlobalState.key(file_hash).set(new_owner)
        return True
