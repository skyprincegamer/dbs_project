export default function FilterSection({ 
  title, 
  items, 
  selectedItems, 
  setSelectedItems, 
  logic, 
  onLogicChange 
}) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
        {title}
      </label>
      <div style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {items.map(item => (
          <label key={item} style={{
            display: 'block',
            padding: '0.25rem 0',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(prev => [...prev, item]);
                } else {
                  setSelectedItems(prev => prev.filter(i => i !== item));
                }
              }}
              style={{ marginRight: '0.5rem' }}
            />
            {item}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem' }}>
          <input
            type="radio"
            checked={logic === 'AND'}
            onChange={() => onLogicChange('AND')}
            style={{ marginRight: '0.25rem' }}
          />
          AND
        </label>
        <label style={{ fontSize: '0.875rem', marginLeft: '1rem' }}>
          <input
            type="radio"
            checked={logic === 'OR'}
            onChange={() => onLogicChange('OR')}
            style={{ marginRight: '0.25rem' }}
          />
          OR
        </label>
      </div>
    </div>
  );
};