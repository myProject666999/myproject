const { sequelize } = require('../config/database');
const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');

const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: posts } = await CommunityPost.findAndCountAll({
      attributes: ['id', 'userId', 'content', 'images', 'likesCount', 'commentsCount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const userId = req.user ? req.user.id : -1;
    
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        const hasLiked = await Like.findOne({
          where: { postId: post.id, userId }
        });
        return {
          ...postJson,
          hasLiked: !!hasLiked,
          images: postJson.images ? postJson.images.split(',') : []
        };
      })
    );
    
    res.json({
      posts: postsWithLikes,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await CommunityPost.findOne({
      where: { id },
      attributes: ['id', 'userId', 'content', 'images', 'likesCount', 'commentsCount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postJson = post.toJSON();
    const userId = req.user ? req.user.id : -1;
    const hasLiked = await Like.findOne({
      where: { postId: id, userId }
    });
    
    res.json({
      post: {
        ...postJson,
        hasLiked: !!hasLiked,
        images: postJson.images ? postJson.images.split(',') : []
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'userId', 'content', 'images', 'likesCount', 'commentsCount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    const postsWithImages = posts.map(post => ({
      ...post.toJSON(),
      images: post.images ? post.images.split(',') : []
    }));
    
    res.json({ posts: postsWithImages });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, images } = req.body;
    
    const post = await CommunityPost.create({
      userId: req.user.id,
      content,
      images: images ? images.join(',') : ''
    });
    
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const post = await CommunityPost.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });
    
    if (!post) {
      await t.rollback();
      return res.status(404).json({ error: 'Post not found' });
    }
    
    await Like.destroy({
      where: { postId: id },
      transaction: t
    });
    
    await Comment.destroy({
      where: { postId: id },
      transaction: t
    });
    
    await post.destroy({ transaction: t });
    
    await t.commit();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const toggleLike = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    const post = await CommunityPost.findByPk(postId, { transaction: t });
    if (!post) {
      await t.rollback();
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const existingLike = await Like.findOne({
      where: { postId, userId },
      transaction: t
    });
    
    let hasLiked;
    
    if (existingLike) {
      await existingLike.destroy({ transaction: t });
      await post.decrement('likesCount', { transaction: t });
      hasLiked = false;
    } else {
      await Like.create({ postId, userId }, { transaction: t });
      await post.increment('likesCount', { transaction: t });
      hasLiked = true;
    }
    
    await t.commit();
    
    const updatedPost = await CommunityPost.findByPk(postId);
    
    res.json({ message: hasLiked ? 'Liked successfully' : 'Unliked successfully', hasLiked, likesCount: updatedPost.likesCount });
  } catch (error) {
    await t.rollback();
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addComment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    const post = await CommunityPost.findByPk(postId, { transaction: t });
    if (!post) {
      await t.rollback();
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      content
    }, { transaction: t });
    
    await post.increment('commentsCount', { transaction: t });
    
    await t.commit();
    
    const commentWithUser = await Comment.findOne({
      where: { id: comment.id },
      include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
    });
    
    res.status(201).json({ message: 'Comment added successfully', comment: commentWithUser });
  } catch (error) {
    await t.rollback();
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.findAll({
      where: { postId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getMyPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getComments
};
