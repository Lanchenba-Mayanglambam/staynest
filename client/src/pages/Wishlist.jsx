import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import ListingCard from '../components/ListingCard.jsx';

export default function Wishlist() {
  const [listings, setListings] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/auth/wishlist')
      .then(({ data }) => setListings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const handleWishlistToggle = (id, inWishlist) => {
    if (!inWishlist) {
      setListings((prev) => prev.filter((item) => item._id !== id));
    }
  };

  if (!listings && !error) return <Loader />;

  return (
    <section>
      <h1>My Wishlist</h1>
      {error && <p className="error">{error}</p>}
      {listings?.length === 0 && (
        <p className="muted">
          No saved stays yet. <Link to="/">Explore stays</Link>
        </p>
      )}
      <div className="grid">
        {listings?.map((l) => (
          <ListingCard key={l._id} listing={l} onWishlistToggle={handleWishlistToggle} />
        ))}
      </div>
    </section>
  );
}
