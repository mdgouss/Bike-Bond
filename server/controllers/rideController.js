const Ride = require('../models/Ride');
const RideParticipant = require('../models/RideParticipant');
const RideReview = require('../models/RideReview');
const GroupChat = require('../models/GroupChat');
const asyncHandler = require('../middleware/async');

const syncRideStatuses = async () => {
  const now = new Date();

  // Ended-by-time rides should be marked completed.
  await Ride.updateMany(
    {
      status: { $nin: ['completed', 'cancelled'] },
      endDate: { $lte: now }
    },
    { status: 'completed' }
  );

  // Future rides are upcoming.
  await Ride.updateMany(
    {
      status: { $nin: ['completed', 'cancelled'] },
      startDate: { $gt: now }
    },
    { status: 'upcoming' }
  );

  // Started rides without an elapsed end date are ongoing.
  await Ride.updateMany(
    {
      status: { $nin: ['completed', 'cancelled'] },
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gt: now } }
      ]
    },
    { status: 'ongoing' }
  );
};

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
exports.getRides = asyncHandler(async (req, res) => {
  await syncRideStatuses();

  const {
    status = 'upcoming',
    difficulty,
    rideType,
    minDistance,
    maxDistance,
    city,
    state,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 10
  } = req.query;

  const query = { isPrivate: false };

  if (status) query.status = status;
  if (difficulty) query.difficulty = difficulty;
  if (rideType) query.rideType = rideType;
  if (city) query['startLocation.name'] = new RegExp(city, 'i');
  
  if (minDistance || maxDistance) {
    query.distance = {};
    if (minDistance) query.distance.$gte = parseInt(minDistance);
    if (maxDistance) query.distance.$lte = parseInt(maxDistance);
  }

  if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const rides = await Ride.find(query)
    .populate('organizer', 'name avatar isVerified')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('startDate');

  const rideIds = rides.map(ride => ride._id);
  const participantCounts = await RideParticipant.aggregate([
    {
      $match: {
        ride: { $in: rideIds },
        status: { $in: ['pending', 'approved', 'completed'] }
      }
    },
    {
      $group: {
        _id: '$ride',
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = participantCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const ridesWithCounts = rides.map(ride => ({
    ...ride.toObject(),
    participantsCount: countMap[ride._id.toString()] || 0
  }));

  const total = await Ride.countDocuments(query);

  res.status(200).json({
    success: true,
    count: ridesWithCounts.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: ridesWithCounts
  });
});

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
exports.getRide = asyncHandler(async (req, res) => {
  await syncRideStatuses();

  const ride = await Ride.findById(req.params.id)
    .populate('organizer', 'name avatar city state isVerified ridesCompleted');

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found'
    });
  }

  // Get participants
  const participants = await RideParticipant.find({ 
    ride: ride._id,
    status: { $in: ['pending', 'approved', 'completed'] }
  }).populate('user', 'name avatar').populate('bike', 'brand model');

  const participantsCount = await RideParticipant.countDocuments({
    ride: ride._id,
    status: { $in: ['pending', 'approved', 'completed'] }
  });

  // Get reviews if completed
  let reviews = [];
  if (ride.status === 'completed') {
    reviews = await RideReview.find({ ride: ride._id })
      .populate('user', 'name avatar')
      .limit(5);
  }

  res.status(200).json({
    success: true,
    data: {
      ...ride.toObject(),
      participantsCount,
      participants,
      reviews
    }
  });
});

// @desc    Create ride
// @route   POST /api/rides
// @access  Private
exports.createRide = asyncHandler(async (req, res) => {
  req.body.organizer = req.user.id;

  const ride = await Ride.create(req.body);

  // Create group chat for the ride
  await GroupChat.create({
    name: ride.title,
    ride: ride._id,
    admin: req.user.id,
    members: [req.user.id]
  });

  // Auto-add organizer as participant
  await RideParticipant.create({
    ride: ride._id,
    user: req.user.id,
    status: 'approved',
    role: 'lead'
  });

  res.status(201).json({
    success: true,
    data: ride
  });
});

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private
exports.updateRide = asyncHandler(async (req, res) => {
  let ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found'
    });
  }

  if (ride.organizer.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this ride'
    });
  }

  ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: ride
  });
});

// @desc    End ride (mark completed)
// @route   PUT /api/rides/:id/end
// @access  Private
exports.endRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found'
    });
  }

  if (ride.organizer.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to end this ride'
    });
  }

  if (ride.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Ride is already completed'
    });
  }

  if (ride.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cancelled ride cannot be completed'
    });
  }

  ride.status = 'completed';
  ride.endDate = req.body?.endDate ? new Date(req.body.endDate) : new Date();
  await ride.save();

  await RideParticipant.updateMany(
    { ride: ride._id, status: { $in: ['pending', 'approved'] } },
    { status: 'completed' }
  );

  res.status(200).json({
    success: true,
    data: ride
  });
});

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private
exports.deleteRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found'
    });
  }

  if (ride.organizer.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this ride'
    });
  }

  await ride.deleteOne();
  await RideParticipant.deleteMany({ ride: req.params.id });
  await GroupChat.deleteOne({ ride: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join ride
// @route   POST /api/rides/:id/join
// @access  Private
exports.joinRide = asyncHandler(async (req, res) => {
  await syncRideStatuses();

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found'
    });
  }

  if (ride.status !== 'upcoming') {
    return res.status(400).json({
      success: false,
      message: 'Cannot join this ride'
    });
  }

  // Check if already joined
  const existing = await RideParticipant.findOne({
    ride: ride._id,
    user: req.user.id
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Already joined this ride'
    });
  }

  // Check max riders
  const currentCount = await RideParticipant.countDocuments({
    ride: ride._id,
    status: { $in: ['pending', 'approved'] }
  });

  if (currentCount >= ride.maxRiders) {
    return res.status(400).json({
      success: false,
      message: 'Ride is full'
    });
  }

  const participant = await RideParticipant.create({
    ride: ride._id,
    user: req.user.id,
    status: 'approved',
    bike: req.body.bikeId,
    notes: req.body.notes
  });

  // Add to group chat
  await GroupChat.findOneAndUpdate(
    { ride: ride._id },
    { $addToSet: { members: req.user.id } }
  );

  res.status(201).json({
    success: true,
    data: participant
  });
});

// @desc    Leave ride
// @route   DELETE /api/rides/:id/leave
// @access  Private
exports.leaveRide = asyncHandler(async (req, res) => {
  const participant = await RideParticipant.findOne({
    ride: req.params.id,
    user: req.user.id
  });

  if (!participant) {
    return res.status(404).json({
      success: false,
      message: 'Not a participant of this ride'
    });
  }

  await participant.deleteOne();

  // Remove from group chat
  await GroupChat.findOneAndUpdate(
    { ride: req.params.id },
    { $pull: { members: req.user.id } }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get my rides (organized and joined)
// @route   GET /api/rides/my
// @access  Private
exports.getMyRides = asyncHandler(async (req, res) => {
  await syncRideStatuses();

  const organized = await Ride.find({ organizer: req.user.id }).sort('-startDate');

  const participations = await RideParticipant.find({ user: req.user.id })
    .populate({
      path: 'ride',
      populate: { path: 'organizer', select: 'name avatar' }
    });

  const organizedIds = organized.map(ride => ride._id);
  const joinedRides = participations
    .filter(p => p.ride && p.ride.organizer._id.toString() !== req.user.id)
    .map(p => ({ ...p.ride.toObject(), participantStatus: p.status }));
  const joinedIds = joinedRides.map(ride => ride._id);

  const allRideIds = [...organizedIds, ...joinedIds];
  const participantCounts = await RideParticipant.aggregate([
    {
      $match: {
        ride: { $in: allRideIds },
        status: { $in: ['pending', 'approved', 'completed'] }
      }
    },
    {
      $group: {
        _id: '$ride',
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = participantCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const organizedWithCounts = organized.map(ride => ({
    ...ride.toObject(),
    participantsCount: countMap[ride._id.toString()] || 0
  }));

  const joined = participations
    .filter(p => p.ride && p.ride.organizer._id.toString() !== req.user.id)
    .map(p => ({
      ...p.ride.toObject(),
      participantStatus: p.status,
      participantsCount: countMap[p.ride._id.toString()] || 0
    }));

  res.status(200).json({
    success: true,
    data: {
      organized: organizedWithCounts,
      joined
    }
  });
});

// @desc    Add ride review
// @route   POST /api/rides/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride || ride.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Can only review completed rides'
    });
  }

  // Check if participated
  const participant = await RideParticipant.findOne({
    ride: ride._id,
    user: req.user.id,
    status: 'completed'
  });

  if (!participant) {
    return res.status(403).json({
      success: false,
      message: 'Only participants can review'
    });
  }

  req.body.ride = ride._id;
  req.body.user = req.user.id;

  const review = await RideReview.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});
