const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const asyncHandler = require('../middleware/async');

// @desc    Get all posts
// @route   GET /api/forum/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    sortBy = 'latest',
    page = 1,
    limit = 20
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  let sortOption = { createdAt: -1 };
  if (sortBy === 'popular') sortOption = { views: -1 };
  if (sortBy === 'mostLiked') sortOption = { 'likes.length': -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const posts = await ForumPost.find(query)
    .populate('author', 'name avatar isVerified')
    .populate('repliesCount')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sortOption);

  const total = await ForumPost.countDocuments(query);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: posts
  });
});

// @desc    Get single post
// @route   GET /api/forum/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name avatar city ridingSince isVerified');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const replies = await ForumReply.find({ post: post._id })
    .populate('author', 'name avatar isVerified')
    .sort('createdAt');

  res.status(200).json({
    success: true,
    data: {
      ...post.toObject(),
      replies
    }
  });
});

// @desc    Create post
// @route   POST /api/forum/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res) => {
  req.body.author = req.user.id;

  const post = await ForumPost.create(req.body);

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update post
// @route   PUT /api/forum/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res) => {
  let post = await ForumPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, content: req.body.content, tags: req.body.tags },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete post
// @route   DELETE /api/forum/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  await post.deleteOne();
  await ForumReply.deleteMany({ post: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like/unlike post
// @route   PUT /api/forum/posts/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const index = post.likes.indexOf(req.user.id);
  if (index > -1) {
    post.likes.splice(index, 1);
  } else {
    post.likes.push(req.user.id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post.likes
  });
});

// @desc    Add reply
// @route   POST /api/forum/posts/:id/replies
// @access  Private
exports.addReply = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (post.isLocked) {
    return res.status(400).json({
      success: false,
      message: 'Post is locked'
    });
  }

  const reply = await ForumReply.create({
    post: post._id,
    author: req.user.id,
    content: req.body.content,
    images: req.body.images,
    parentReply: req.body.parentReply
  });

  await reply.populate('author', 'name avatar isVerified');

  res.status(201).json({
    success: true,
    data: reply
  });
});

// @desc    Delete reply
// @route   DELETE /api/forum/replies/:id
// @access  Private
exports.deleteReply = asyncHandler(async (req, res) => {
  const reply = await ForumReply.findById(req.params.id);

  if (!reply) {
    return res.status(404).json({
      success: false,
      message: 'Reply not found'
    });
  }

  if (reply.author.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  await reply.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get categories
// @route   GET /api/forum/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = [
    { id: 'general', name: 'General Discussion', icon: '💬' },
    { id: 'gear', name: 'Gear & Equipment', icon: '🎒' },
    { id: 'maintenance', name: 'Maintenance & Tips', icon: '🔧' },
    { id: 'routes', name: 'Routes & Destinations', icon: '🗺️' },
    { id: 'safety', name: 'Safety & Awareness', icon: '⚠️' },
    { id: 'ladakh', name: 'Ladakh Trips', icon: '🏔️' },
    { id: 'north-east', name: 'North-East India', icon: '🌄' },
    { id: 'rajasthan', name: 'Rajasthan', icon: '🏜️' },
    { id: 'south-india', name: 'South India', icon: '🌴' },
    { id: 'beginners', name: 'Beginners Corner', icon: '🆕' },
    { id: 'events', name: 'Events & Meetups', icon: '📅' },
    { id: 'off-topic', name: 'Off-Topic', icon: '🎯' }
  ];

  // Get post counts for each category
  const counts = await ForumPost.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const countMap = counts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    postCount: countMap[cat.id] || 0
  }));

  res.status(200).json({
    success: true,
    data: categoriesWithCount
  });
});
