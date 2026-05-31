const ContractModel = require('../models/ContractModel');
const SignerModel = require('../models/SignerModel');
const ContractLogModel = require('../models/ContractLogModel');
const { computeChainHash } = require('../utils/hash');

const SignerController = {
    async sign(req, res) {
        try {
            const { id } = req.params;
            const { signature_image, signature_type, comment } = req.body;

            if (!signature_image) {
                return res.status(400).json({ error: '请提供签名' });
            }

            const contract = await ContractModel.findById(id);
            if (!contract) {
                return res.status(404).json({ error: '合同不存在' });
            }
            if (contract.status !== 'pending_signing') {
                return res.status(400).json({ error: '合同不在签署状态' });
            }

            const signer = await SignerModel.findByContractAndOrder(
                id, contract.current_sign_order
            );
            if (!signer) {
                return res.status(400).json({ error: '未找到当前签署方' });
            }
            if (signer.user_id !== req.user.id) {
                return res.status(403).json({ error: '当前不是您的签署轮次' });
            }

            await SignerModel.update(signer.id, {
                status: 'signed',
                signature_image,
                signature_type: signature_type || 'handwritten',
                signed_at: new Date(),
                comment: comment || null
            });

            const signers = await SignerModel.findByContractId(id);
            const currentOrder = contract.current_sign_order;
            const totalSigners = signers.length;

            if (currentOrder >= totalSigners) {
                await ContractModel.update(id, {
                    status: 'completed',
                    signed_at: new Date()
                });

                const lastHash = await ContractLogModel.getLastHash(id);
                const chainHash = computeChainHash(lastHash, {
                    action: 'complete', contract_id: id
                });
                await ContractLogModel.create({
                    contract_id: id, user_id: req.user.id, action: 'complete',
                    detail: '合同签署完成', hash_chain: chainHash
                });
            } else {
                await ContractModel.update(id, {
                    current_sign_order: currentOrder + 1
                });
            }

            const lastHash = await ContractLogModel.getLastHash(id);
            const chainHash = computeChainHash(lastHash, {
                action: 'sign', contract_id: id, signer_id: signer.id
            });
            await ContractLogModel.create({
                contract_id: id, user_id: req.user.id, action: 'sign',
                detail: `${req.user.name} 签署了合同`, hash_chain: chainHash
            });

            res.json({ message: '签署成功' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async reject(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            const contract = await ContractModel.findById(id);
            if (!contract) {
                return res.status(404).json({ error: '合同不存在' });
            }
            if (contract.status !== 'pending_signing') {
                return res.status(400).json({ error: '合同不在签署状态' });
            }

            const signer = await SignerModel.findByContractAndOrder(
                id, contract.current_sign_order
            );
            if (!signer || signer.user_id !== req.user.id) {
                return res.status(403).json({ error: '当前不是您的签署轮次' });
            }

            await SignerModel.update(signer.id, {
                status: 'rejected',
                comment: comment || '无拒绝理由'
            });
            await ContractModel.update(id, { status: 'rejected' });

            const lastHash = await ContractLogModel.getLastHash(id);
            const chainHash = computeChainHash(lastHash, {
                action: 'reject', contract_id: id, signer_id: signer.id
            });
            await ContractLogModel.create({
                contract_id: id, user_id: req.user.id, action: 'reject',
                detail: `${req.user.name} 拒绝了合同：${comment || ''}`, hash_chain: chainHash
            });

            res.json({ message: '已拒绝合同' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = SignerController;
