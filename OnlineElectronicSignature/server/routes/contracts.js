const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ContractController = require('../controllers/ContractController');
const SignerController = require('../controllers/SignerController');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', auth, ContractController.list);
router.get('/my', auth, ContractController.myContracts);
router.get('/pending', auth, ContractController.pendingContracts);
router.get('/signed', auth, ContractController.signedContracts);
router.get('/archived', auth, ContractController.archivedList);
router.get('/:id', auth, ContractController.detail);
router.post('/upload', auth, upload.single('file'), ContractController.uploadFile);
router.post('/', auth, ContractController.create);
router.post('/:id/submit', auth, ContractController.submit);
router.post('/:id/sign', auth, SignerController.sign);
router.post('/:id/reject', auth, SignerController.reject);
router.post('/:id/archive', auth, ContractController.archive);
router.get('/:id/verify', auth, ContractController.verifyChain);

module.exports = router;
