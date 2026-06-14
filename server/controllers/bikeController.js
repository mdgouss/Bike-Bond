const Bike = require('../models/Bike');
const asyncHandler = require('../middleware/async');

// @desc    Get user's bikes (garage)
// @route   GET /api/bikes
// @access  Private
exports.getMyBikes = asyncHandler(async (req, res) => {
  const bikes = await Bike.find({ user: req.user.id }).sort('-isPrimary -createdAt');

  res.status(200).json({
    success: true,
    count: bikes.length,
    data: bikes
  });
});

// @desc    Get single bike
// @route   GET /api/bikes/:id
// @access  Public
exports.getBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findById(req.params.id).populate('user', 'name avatar city');

  if (!bike) {
    return res.status(404).json({
      success: false,
      message: 'Bike not found'
    });
  }

  res.status(200).json({
    success: true,
    data: bike
  });
});

// @desc    Add bike to garage
// @route   POST /api/bikes
// @access  Private
exports.addBike = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  // If this is the first bike, make it primary
  const existingBikes = await Bike.countDocuments({ user: req.user.id });
  if (existingBikes === 0) {
    req.body.isPrimary = true;
  }

  const bike = await Bike.create(req.body);

  res.status(201).json({
    success: true,
    data: bike
  });
});

// @desc    Update bike
// @route   PUT /api/bikes/:id
// @access  Private
exports.updateBike = asyncHandler(async (req, res) => {
  let bike = await Bike.findById(req.params.id);

  if (!bike) {
    return res.status(404).json({
      success: false,
      message: 'Bike not found'
    });
  }

  // Check ownership
  if (bike.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this bike'
    });
  }

  bike = await Bike.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: bike
  });
});

// @desc    Delete bike from garage
// @route   DELETE /api/bikes/:id
// @access  Private
exports.deleteBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findById(req.params.id);

  if (!bike) {
    return res.status(404).json({
      success: false,
      message: 'Bike not found'
    });
  }

  if (bike.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this bike'
    });
  }

  await bike.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload bike photos
// @route   PUT /api/bikes/:id/photos
// @access  Private
exports.uploadPhotos = asyncHandler(async (req, res) => {
  const bike = await Bike.findById(req.params.id);

  if (!bike) {
    return res.status(404).json({
      success: false,
      message: 'Bike not found'
    });
  }

  if (bike.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload files'
    });
  }

  const photoNames = req.files.map(file => file.filename);
  bike.photos = [...bike.photos, ...photoNames].slice(0, 5); // Max 5 photos
  await bike.save();

  res.status(200).json({
    success: true,
    data: bike.photos
  });
});

// @desc    Set primary bike
// @route   PUT /api/bikes/:id/primary
// @access  Private
exports.setPrimaryBike = asyncHandler(async (req, res) => {
  const bike = await Bike.findById(req.params.id);

  if (!bike) {
    return res.status(404).json({
      success: false,
      message: 'Bike not found'
    });
  }

  if (bike.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  bike.isPrimary = true;
  await bike.save();

  res.status(200).json({
    success: true,
    data: bike
  });
});
