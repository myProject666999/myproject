const menuController = require('../controllers/menuController');

const router = require('koa-router')();

router.get('/week', menuController.getWeekMenu);
router.post('/', menuController.addToMenu);
router.delete('/:id', menuController.removeFromMenu);

router.get('/shopping-list/generate', menuController.generateShoppingList);
router.get('/shopping-list', menuController.getShoppingList);
router.put('/shopping-list/:id', menuController.toggleShoppingItem);

module.exports = router;
