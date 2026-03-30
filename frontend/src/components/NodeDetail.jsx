/**
 * Node detail overlay panel.
 * Shows metadata about a selected node and its relationships.
 * Allows navigation to connected nodes.
 */
export default function NodeDetail({ node, onClose, onNavigate }) {
  if (!node) return null

  // Fields to hide from the detail view (internal/display fields)
  const hiddenFields = new Set(['nodeId', 'type', 'label', 'color', 'val', 'neighbors', 'x', 'y', 'vx', 'vy', 'index', 'fx', 'fy'])

  const properties = Object.entries(node)
    .filter(([key]) => !hiddenFields.has(key))
    .filter(([, val]) => val !== null && val !== '' && val !== undefined)

  return (
    <div className="node-detail-overlay">
      <div className="node-detail-header">
        <h3>
          <span
            className="node-type-badge"
            style={{ background: node.color || '#999' }}
          >
            {node.type}
          </span>
          {node.label}
        </h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="node-detail-body">
        {/* Properties */}
        <div className="detail-section">
          <h4>Properties</h4>
          {properties.map(([key, value]) => (
            <div className="detail-row" key={key}>
              <span className="detail-key">{formatKey(key)}</span>
              <span className="detail-value">{formatValue(value)}</span>
            </div>
          ))}
        </div>

        {/* Connected Nodes */}
        {node.neighbors && node.neighbors.length > 0 && (
          <div className="detail-section">
            <h4>Connected Nodes ({node.neighbors.length})</h4>
            {node.neighbors.map((neighbor, idx) => (
              <div
                key={idx}
                className="neighbor-item"
                onClick={() => onNavigate(neighbor.nodeId)}
              >
                <span className="neighbor-direction">
                  {neighbor.direction === 'incoming' ? '←' : '→'}
                </span>
                <span className="neighbor-label">
                  {neighbor.label || neighbor.id}
                </span>
                <span className="neighbor-relation">
                  {neighbor.relation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatKey(key) {
  // camelCase to Title Case
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString()
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (typeof value === 'string' && value.includes('T00:00:00')) {
    return value.split('T')[0]
  }
  return String(value)
}
