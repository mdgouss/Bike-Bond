const User = require('../models/User');
const Bike = require('../models/Bike');
const RideParticipant = require('../models/RideParticipant');
const RideReview = require('../models/RideReview');
const asyncHandler = require('../middleware/async');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res) => {
  const {
    city,
    state,
    ridingStyle,
    minExperience,
    isVerified,
    search,
    page = 1,
    limit = 20
  } = req.query;

  const query = {};

  if (city) query.city = new RegExp(city, 'i');
  if (state) query.state = new RegExp(state, 'i');
  if (ridingStyle) query.ridingStyles = ridingStyle;
  if (isVerified === 'true') query.isVerified = true;
  
  if (minExperience) {
    const minYear = new Date().getFullYear() - parseInt(minExperience);
    query.ridingSince = { $lte: minYear };
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { city: new RegExp(search, 'i') }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('name avatar city state ridingSince ridingStyles isVerified ridesCompleted rating')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('-lastActive');

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: users
  });
});

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-emergencyContacts');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's bikes
  const bikes = await Bike.find({ user: user._id });
  const completedSummary = await RideParticipant.aggregate([
    {
      $match: {
        user: user._id,
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'rides',
        localField: 'ride',
        foreignField: '_id',
        as: 'rideDoc'
      }
    },
    { $unwind: '$rideDoc' },
    {
      $group: {
        _id: null,
        ridesCompleted: { $sum: 1 },
        totalKmRidden: { $sum: { $ifNull: ['$rideDoc.distance', 0] } }
      }
    }
  ]);
  const completedRides = completedSummary[0]?.ridesCompleted || 0;
  const totalKmRidden = completedSummary[0]?.totalKmRidden || 0;
  const ratingSummary = await RideReview.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  const rating = ratingSummary[0]?.avgRating || 0;

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      ridesCompleted: completedRides,
      totalKmRidden,
      rating,
      bikes
    }
  });
});

// @desc    Find riding buddies
// @route   GET /api/users/buddies
// @access  Private
exports.findBuddies = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);

  // Find users in same city/state with similar riding styles
  const buddies = await User.find({
    _id: { $ne: req.user.id },
    $or: [
      { city: currentUser.city },
      { state: currentUser.state }
    ],
    ridingStyles: { $in: currentUser.ridingStyles }
  })
    .select('name avatar city state ridingSince ridingStyles isVerified ridesCompleted')
    .limit(20)
    .sort('-lastActive');

  res.status(200).json({
    success: true,
    count: buddies.length,
    data: buddies
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const bikes = await Bike.countDocuments({ user: user._id });
  const completedSummary = await RideParticipant.aggregate([
    {
      $match: {
        user: user._id,
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'rides',
        localField: 'ride',
        foreignField: '_id',
        as: 'rideDoc'
      }
    },
    { $unwind: '$rideDoc' },
    {
      $group: {
        _id: null,
        ridesCompleted: { $sum: 1 },
        totalKmRidden: { $sum: { $ifNull: ['$rideDoc.distance', 0] } }
      }
    }
  ]);
  const completedRides = completedSummary[0]?.ridesCompleted || 0;
  const totalKmRidden = completedSummary[0]?.totalKmRidden || 0;
  const ratingSummary = await RideReview.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  const rating = ratingSummary[0]?.avgRating || 0;

  res.status(200).json({
    success: true,
    data: {
      ridesCompleted: completedRides,
      totalKmRidden,
      bikesOwned: bikes,
      rating,
      memberSince: user.createdAt
    }
  });
});
