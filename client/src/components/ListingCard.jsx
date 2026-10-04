import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/format.js';

export default function ListingCard({ listing, onWishlistToggle }) {
  const { user, updateWishlist } = useAuth();
  const navigate = useNavigate();

  const inWishlist = Boolean(
    user?.wishlist?.some((id) => (id._id || id).toString() === listing._id.toString())
  );

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post(`/auth/wishlist/${listing._id}`);
      updateWishlist(data.wishlist);
      onWishlistToggle?.(listing._id, data.inWishlist);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  return (
    <Link to={`/stays/${listing._id}`} className="card listing-card">
      <div className="card-thumb-wrap">
        <img src={listing.images[0]} alt={listing.title} />
        <button
          type="button"
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          ♥
        </button>
      </div>
      <div className="card-body">
        <div className="row-between">
          <span className="tag">{listing.type}</span>
          <span className="muted">
            {listing.reviewCount > 0 ? `★ ${listing.avgRating} (${listing.reviewCount})` : 'New'}
          </span>
        </div>
        <strong className="listing-title">{listing.title}</strong>
        <span className="muted">{listing.city}, {listing.state}</span>
        <span>
          <strong>{formatINR(listing.pricePerNight)}</strong> <span className="muted">/ night</span>
        </span>
      </div>
    </Link>
  );
}
