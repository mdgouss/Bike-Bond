const Listing = require('../models/Listing');
const asyncHandler = require('../middleware/async');

// @desc    Get all listings
// @route   GET /api/marketplace
// @access  Public
exports.getListings = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    condition,
    city,
    state,
    search,
    sortBy = 'latest',
    page = 1,
    limit = 20
  } = req.query;

  const query = { status: 'active' };

  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  if (search) query.$text = { $search: search };

  let sortOption = { createdAt: -1 };
  if (sortBy === 'priceLow') sortOption = { price: 1 };
  if (sortBy === 'priceHigh') sortOption = { price: -1 };
  if (sortBy === 'popular') sortOption = { views: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const listings = await Listing.find(query)
    .populate('seller', 'name avatar city isVerified')
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sortOption);

  const total = await Listing.countDocuments(query);

  res.status(200).json({
    success: true,
    count: listings.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: listings
  });
});

// @desc    Get single listing
// @route   GET /api/marketplace/:id
// @access  Public
exports.getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('seller', 'name avatar city state phone isVerified createdAt');

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Create listing
// @route   POST /api/marketplace
// @access  Private
exports.createListing = asyncHandler(async (req, res) => {
  req.body.seller = req.user.id;
  req.body.location = {
    city: req.user.city,
    state: req.user.state
  };

  const listing = await Listing.create(req.body);

  res.status(201).json({
    success: true,
    data: listing
  });
});

// @desc    Update listing
// @route   PUT /api/marketplace/:id
// @access  Private
exports.updateListing = asyncHandler(async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  if (listing.seller.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Delete listing
// @route   DELETE /api/marketplace/:id
// @access  Private
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  if (listing.seller.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  await listing.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark listing as sold
// @route   PUT /api/marketplace/:id/sold
// @access  Private
exports.markAsSold = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  if (listing.seller.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  listing.status = 'sold';
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Save/unsave listing
// @route   PUT /api/marketplace/:id/save
// @access  Private
exports.toggleSave = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  const index = listing.savedBy.indexOf(req.user.id);
  if (index > -1) {
    listing.savedBy.splice(index, 1);
  } else {
    listing.savedBy.push(req.user.id);
  }

  await listing.save();

  res.status(200).json({
    success: true,
    data: listing.savedBy
  });
});

// @desc    Get my listings
// @route   GET /api/marketplace/my
// @access  Private
exports.getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user.id })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings
  });
});

// @desc    Get saved listings
// @route   GET /api/marketplace/saved
// @access  Private
exports.getSavedListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ 
    savedBy: req.user.id,
    status: 'active'
  })
    .populate('seller', 'name avatar city')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings
  });
});

// @desc    Upload listing photos
// @route   PUT /api/marketplace/:id/photos
// @access  Private
exports.uploadPhotos = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  if (listing.seller.toString() !== req.user.id) {
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
  listing.photos = [...listing.photos, ...photoNames].slice(0, 10);
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing.photos
  });
});
