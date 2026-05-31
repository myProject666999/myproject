const path = require('path');
const fs = require('fs');
const ContractModel = require('../models/ContractModel');
const SignerModel = require('../models/SignerModel');
const ContractLogModel = require('../models/ContractLogModel');
const { computeFileHash, computeChainHash } = require('../utils/hash');

const ContractController = {
    async list(req, res) {
        try {
            const { status } = req.query;
            const filters = {};
            if (status) filters.status = status;
            const contracts = await ContractModel.findAll(filters);
            for (const c of contracts) {
                c.signers = await SignerModel.findByContractId(c.id);
            }
            res.json(contracts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async myContracts(req, res) {
        try {
            const contracts = await ContractModel.findAll({ initiator_id: req.user.id });
            for (const c of contracts) {
                c.signers = await SignerModel.findByContractId(c.id);
            }
            res.json(contracts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async pendingContracts(req, res) {
        try {
            const contracts = await ContractModel.findPendingByUserId(req.user.id);
            for (const c of contracts) {
                c.signers = await SignerModel.findByContractId(c.id);
            }
            res.json(contracts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async signedContracts(req, res) {
        try {
            const contracts = await ContractModel.findSignedByUserId(req.user.id);
            for (const c of contracts) {
                c.signers = await SignerModel.findByContractId(c.id);
            }
            res.json(contracts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async detail(req, res) {
        try {
            const { id } = req.params;
            const contract = await ContractModel.findById(id);
            if (!contract) {
                return res.status(404).json({ error: '合同不存在' });
            }
            contract.signers = await SignerModel.findByContractId(id);
            contract.logs = await ContractLogModel.findByContractId(id);
            res.json(contract);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: '未上传文件' });
            }
            const filePath = req.file.path;
            const fileHash = await computeFileHash(filePath);
            const fileName = path.basename(filePath);
            const fileUrl = `/uploads/${fileName}`;
            const originalName = req.file.originalname;
            res.json({ file_url: fileUrl, file_hash: fileHash, file_name: originalName });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { title, description, file_url, file_hash, file_name, signers } = req.body;
            if (!title) {
                return res.status(400).json({ error: '合同标题不能为空' });
            }
            if (!signers || signers.length === 0) {
                return res.status(400).json({ error: '至少需要一位签署方' });
            }
            const contractId = await ContractModel.create({
                title, description, file_url, file_hash, file_name, initiator_id: req.user.id
            });

            const signerList = signers.map((s, i) => ({
                contract_id: contractId, user_id: s.user_id, sign_order: i + 1
            }));
            await SignerModel.batchCreate(signerList);

            const lastHash = await ContractLogModel.getLastHash(contractId);
            const chainHash = computeChainHash(lastHash, { action: 'create', title });
            await ContractLogModel.create({
                contract_id: contractId, user_id: req.user.id, action: 'create',
                detail: `发起合同：${title}`, hash_chain: chainHash
            });

            res.json({ id: contractId, message: '合同创建成功' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async submit(req, res) {
        try {
            const { id } = req.params;
            const contract = await ContractModel.findById(id);
            if (!contract) {
                return res.status(404).json({ error: '合同不存在' });
            }
            if (contract.initiator_id !== req.user.id) {
                return res.status(403).json({ error: '只有发起人可以提交合同' });
            }
            if (contract.status !== 'draft') {
                return res.status(400).json({ error: '合同只能从草稿状态提交' });
            }
            await ContractModel.update(id, { status: 'pending_signing' });

            const lastHash = await ContractLogModel.getLastHash(id);
            const chainHash = computeChainHash(lastHash, { action: 'submit', contract_id: id });
            await ContractLogModel.create({
                contract_id: id, user_id: req.user.id, action: 'submit',
                detail: '提交合同，进入签署流程', hash_chain: chainHash
            });

            res.json({ message: '合同已提交，等待签署' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async archive(req, res) {
        try {
            const { id } = req.params;
            const contract = await ContractModel.findById(id);
            if (!contract) {
                return res.status(404).json({ error: '合同不存在' });
            }
            if (contract.status !== 'completed') {
                return res.status(400).json({ error: '只有已完成的合同才能归档' });
            }
            await ContractModel.update(id, {
                status: 'archived',
                archived_at: new Date()
            });

            const lastHash = await ContractLogModel.getLastHash(id);
            const chainHash = computeChainHash(lastHash, { action: 'archive', contract_id: id });
            await ContractLogModel.create({
                contract_id: id, user_id: req.user.id, action: 'archive',
                detail: '合同已归档', hash_chain: chainHash
            });

            res.json({ message: '合同已归档' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async archivedList(req, res) {
        try {
            const contracts = await ContractModel.findAll({ status: 'archived' });
            for (const c of contracts) {
                c.signers = await SignerModel.findByContractId(c.id);
            }
            res.json(contracts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async verifyChain(req, res) {
        try {
            const { id } = req.params;
            const logs = await ContractLogModel.findByContractId(id);
            const contract = await ContractModel.findById(id);
            const results = [];
            let prevHash = null;
            for (const log of logs.reverse()) {
                const expected = computeChainHash(prevHash, { action: log.action, detail: log.detail });
                const valid = expected === log.hash_chain;
                results.push({ id: log.id, action: log.action, valid, expected, actual: log.hash_chain });
                prevHash = log.hash_chain;
            }
            const allValid = results.every(r => r.valid);
            res.json({ valid: allValid, details: results, contract_hash: contract?.file_hash });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ContractController;
