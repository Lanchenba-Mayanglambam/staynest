import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  wishlist: user.wishlist || [],
  token: generateToken(user._id),
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'host' ? 'host' : 'guest',
  });
  res.status(201).json(userResponse(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json(userResponse(user));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// GET /api/auth/wishlist (and /api/wishlist)
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'host', select: 'name' },
  });
  const listings = (user.wishlist || []).filter(Boolean);
  res.json(listings);
});

// POST /api/auth/wishlist/:id (and /api/wishlist/:id)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const listingId = req.params.id || req.body.listingId;
  if (!listingId) {
    res.status(400);
    throw new Error('Listing ID is required');
  }

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    res.status(400);
    throw new Error('Invalid listing ID format');
  }

  const listingExists = await Listing.exists({ _id: listingId });
  if (!listingExists) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const user = await User.findById(req.user._id);
  const existsIndex = user.wishlist.findIndex((id) => id.toString() === listingId.toString());

  let inWishlist;
  if (existsIndex > -1) {
    user.wishlist.splice(existsIndex, 1);
    inWishlist = false;
  } else {
    user.wishlist.push(listingId);
    inWishlist = true;
  }

  await user.save();
  res.json({ inWishlist, wishlist: user.wishlist });
});
