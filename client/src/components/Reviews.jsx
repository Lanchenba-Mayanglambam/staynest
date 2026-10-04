import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [editError, setEditError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  const load = () => api.get(`/listings/${listingId}/reviews`).then(({ data }) => setReviews(data));

  useEffect(() => {
    load();
  }, [listingId]);

  const hasReviewed = Boolean(
    user && reviews.some((r) => r.user?._id === user._id || r.user === user._id)
  );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/listings/${listingId}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      await load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditForm({ rating: review.rating, comment: review.comment });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setLoadingEdit(true);
    try {
      await api.put(`/listings/${listingId}/reviews/${editingId}`, editForm);
      setEditingId(null);
      await load();
      onReviewAdded?.();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setLoadingEdit(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setDeleteError('');
    try {
      await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
      if (editingId === reviewId) setEditingId(null);
      await load();
      onReviewAdded?.();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {deleteError && <p className="error">{deleteError}</p>}
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => {
        const isOwner = user && (r.user?._id === user._id || r.user === user._id);
        const isEditing = editingId === r._id;

        return (
          <div key={r._id} className="review">
            <div className="row-between">
              <div>
                <strong>{r.user?.name || 'Guest'}</strong>
                {isOwner && <span className="muted small" style={{ marginLeft: '8px' }}>(You)</span>}
              </div>
              <div className="row" style={{ gap: '8px' }}>
                <span className="muted small">{formatDate(r.createdAt)}</span>
                {isOwner && !isEditing && (
                  <div className="row" style={{ gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteReview(r._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <form className="card form" style={{ marginTop: '10px', padding: '16px' }} onSubmit={submitEdit}>
                <h4>Edit your review</h4>
                <StarRating
                  value={editForm.rating}
                  onChange={(rating) => setEditForm((prev) => ({ ...prev, rating }))}
                />
                <textarea
                  required
                  placeholder="How was your stay?"
                  value={editForm.comment}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                />
                {editError && <p className="error">{editError}</p>}
                <div className="row" style={{ gap: '8px' }}>
                  <button type="submit" className="btn btn-sm" disabled={loadingEdit}>
                    {loadingEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={loadingEdit}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="stars-static">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                <p>{r.comment}</p>
              </>
            )}
          </div>
        );
      })}

      {user && !hasReviewed && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}
