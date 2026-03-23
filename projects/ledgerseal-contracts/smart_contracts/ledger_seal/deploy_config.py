import logging

import algokit_utils

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.ledger_seal.ledger_seal_client import (
        RegisterEvidenceArgs,
        GetOwnerArgs,
        TransferOwnershipArgs,
        LedgerSealFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        LedgerSealFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=3),  # Extra for state
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Test register
    mock_hash = b"sha256:5f4dcc3b5aa765d61d8327deb882cf99"
    mock_meta = b"meta:abc123"
    register_resp = app_client.send.register_evidence(
        args=RegisterEvidenceArgs(file_hash=mock_hash, metadata_hash=mock_meta, owner=deployer_.address)
    )
    logger.info(f"Registered evidence: {register_resp.abi_return}")

    # Test get owner
    owner_resp = app_client.send.get_owner(args=GetOwnerArgs(file_hash=mock_hash))
    logger.info(f"Owner: {owner_resp.abi_return}")

    logger.info(f"Deployed {app_client.app_name} ({app_client.app_id}) successfully")
