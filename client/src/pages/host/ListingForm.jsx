import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');

  const validate = (formData) => {
    const errs = {};
    const trimmedTitle = formData.title.trim();
    if (trimmedTitle.length < 10 || trimmedTitle.length > 100) {
      errs.title = 'Title must be between 10 and 100 characters.';
    }

    const trimmedDesc = formData.description.trim();
    if (trimmedDesc.length < 30) {
      errs.description = 'Description must be at least 30 characters.';
    }

    const price = Number(formData.pricePerNight);
    if (!formData.pricePerNight || isNaN(price) || price <= 0) {
      errs.pricePerNight = 'Price per night must be greater than 0.';
    }

    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        const parsed = new URL(formData.imageUrl.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errs.imageUrl = 'Image URL must start with http:// or https://.';
        }
      } catch {
        errs.imageUrl = 'Please enter a valid image URL.';
      }
    }

    return errs;
  };

  const validationErrors = validate(form);
  const hasErrors = Object.keys(validationErrors).length > 0;

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    if (hasErrors) return;
    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={set('title')}
        onBlur={handleBlur('title')}
      />
      {touched.title && validationErrors.title && (
        <span className="error small">{validationErrors.title}</span>
      )}
      <textarea
        required
        placeholder="Describe your place"
        value={form.description}
        onChange={set('description')}
        onBlur={handleBlur('description')}
      />
      {touched.description && validationErrors.description && (
        <span className="error small">{validationErrors.description}</span>
      )}
      <div className="row">
        <select className="grow" value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="grow">
          <input
            required
            type="number"
            min="0"
            placeholder="Price per night (₹)"
            value={form.pricePerNight}
            onChange={set('pricePerNight')}
            onBlur={handleBlur('pricePerNight')}
          />
          {touched.pricePerNight && validationErrors.pricePerNight && (
            <span className="error small">{validationErrors.pricePerNight}</span>
          )}
        </div>
      </div>
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      <input
        placeholder="Image URL (optional)"
        value={form.imageUrl}
        onChange={set('imageUrl')}
        onBlur={handleBlur('imageUrl')}
      />
      {touched.imageUrl && validationErrors.imageUrl && (
        <span className="error small">{validationErrors.imageUrl}</span>
      )}
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={hasErrors}>
        {isEdit ? 'Save changes' : 'Publish listing'}
      </button>
    </form>
  );
}
