const recipeController = require('../controllers/recipeController');
const interactionController = require('../controllers/interactionController');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

const router = require('koa-router')();

router.get('/', recipeController.getRecipeList);
router.get('/my', requireAuth, recipeController.getMyRecipes);
router.get('/:id', recipeController.getRecipeDetail);
router.post('/', requireAuth, recipeController.createRecipe);
router.put('/:id', requireAuth, recipeController.updateRecipe);
router.delete('/:id', requireAuth, recipeController.deleteRecipe);

router.post('/:recipeId/like', requireAuth, interactionController.toggleLike);
router.post('/:recipeId/favorite', requireAuth, interactionController.toggleFavorite);
router.get('/favorites/list', requireAuth, interactionController.getMyFavorites);

router.get('/:recipeId/comments', commentController.getComments);
router.post('/:recipeId/comments', requireAuth, commentController.createComment);
router.delete('/comments/:id', requireAuth, commentController.deleteComment);

module.exports = router;
