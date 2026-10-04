import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '', checkIn: '', checkOut: '' };
const today = new Date().toISOString().split('T')[0];

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (params) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: clean })
      .then(({ data }) => setListings(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial);
  }, []);

  const set = (key) => (e) => {
    const val = e.target.value;
    if (key === 'checkIn' && filters.checkOut && val >= filters.checkOut) {
      setFilters({ ...filters, checkIn: val, checkOut: '' });
    } else {
      setFilters({ ...filters, [key]: val });
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (filters.checkIn && filters.checkOut && filters.checkIn >= filters.checkOut) {
      setError('Check-out date must be after check-in date');
      return;
    }
    search(filters);
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type={filters.checkIn ? 'date' : 'text'}
            placeholder="Check-in"
            aria-label="Check-in date"
            title="Check-in date"
            value={filters.checkIn}
            min={today}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            onChange={set('checkIn')}
          />
          <input
            type={filters.checkOut ? 'date' : 'text'}
            placeholder="Check-out"
            aria-label="Check-out date"
            title="Check-out date"
            value={filters.checkOut}
            min={filters.checkIn || today}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            onChange={set('checkOut')}
          />
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <div className="grid">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
    </section>
  );
}
