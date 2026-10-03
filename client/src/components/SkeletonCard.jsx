export default function SkeletonCard() {
  return (
    <div className="card listing-card skeleton-card" aria-hidden="true">
      <div className="skeleton-thumb skeleton-shimmer" />
      <div className="card-body">
        <div className="row-between">
          <div className="skeleton-pill skeleton-shimmer" />
          <div className="skeleton-text skeleton-shimmer" style={{ width: '50px', height: '14px' }} />
        </div>
        <div className="skeleton-text skeleton-shimmer" style={{ width: '80%', height: '18px', marginTop: '2px' }} />
        <div className="skeleton-text skeleton-shimmer" style={{ width: '50%', height: '14px' }} />
        <div className="skeleton-text skeleton-shimmer" style={{ width: '40%', height: '16px', marginTop: '2px' }} />
      </div>
    </div>
  );
}
