import { Router } from 'express';
import { register, login, getMe, getWishlist, toggleWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, toggleWishlist);
router.post('/wishlist', protect, toggleWishlist);

export default router;
