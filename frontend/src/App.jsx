import { useState, useEffect, useCallback } from 'react'
import GraphView from './components/GraphView'
import ChatPanel from './components/ChatPanel'
import NodeDetail from './components/NodeDetail'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [stats, setStats] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch graph data and stats on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/graph`).then(r => r.json()),
      fetch(`${API_BASE}/api/graph/stats`).then(r => r.json()),
    ])
      .then(([graph, statsData]) => {
        setGraphData(graph)
        setStats(statsData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load graph:', err)
        setLoading(false)
      })
  }, [])

  // Handle node click - fetch details and focus
  const handleNodeClick = useCallback((nodeId) => {
    fetch(`${API_BASE}/api/graph/node/${encodeURIComponent(nodeId)}`)
      .then(r => r.json())
      .then(data => setSelectedNode(data))
      .catch(console.error)
  }, [])

  // Handle filter by node type
  const handleFilter = useCallback((type) => {
    if (type === activeFilter) {
      // Remove filter - reload full graph
      setActiveFilter(null)
      fetch(`${API_BASE}/api/graph`)
        .then(r => r.json())
        .then(setGraphData)
    } else {
      setActiveFilter(type)
      fetch(`${API_BASE}/api/graph?node_type=${type}`)
        .then(r => r.json())
        .then(setGraphData)
    }
  }, [activeFilter])

  // Handle expanding a node to see its neighborhood
  const handleExpandNode = useCallback((nodeId) => {
    fetch(`${API_BASE}/api/graph?center=${encodeURIComponent(nodeId)}&depth=2`)
      .then(r => r.json())
      .then(data => {
        setGraphData(data)
        setActiveFilter(null)
      })
  }, [])

  // Reset graph to full view
  const handleResetGraph = useCallback(() => {
    setActiveFilter(null)
    fetch(`${API_BASE}/api/graph`)
      .then(r => r.json())
      .then(setGraphData)
  }, [])

  // Handle highlighted nodes from chat responses
  const handleHighlightNodes = useCallback((nodes) => {
    setHighlightNodes(new Set(nodes))
    // Auto-clear highlight after 10 seconds
    if (nodes.length > 0) {
      setTimeout(() => setHighlightNodes(new Set()), 10000)
    }
  }, [])

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <h2>Loading SAP O2C Graph</h2>
        <p>Initializing database and building graph...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>SAP <span>O2C</span> Graph Explorer</h1>
        <div className="header-stats">
          {stats && (
            <>
              <div className="stat">
                Nodes: <span className="stat-value">{stats.total_nodes}</span>
              </div>
              <div className="stat">
                Edges: <span className="stat-value">{stats.total_edges}</span>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="app-body">
        <div className="graph-panel">
          <div className="graph-controls">
            <div className="filter-bar">
              <button
                className={`filter-btn ${!activeFilter ? 'active' : ''}`}
                onClick={handleResetGraph}
              >
                All
              </button>
              {stats && Object.keys(stats.node_types).map(type => (
                <button
                  key={type}
                  className={`filter-btn ${activeFilter === type ? 'active' : ''}`}
                  onClick={() => handleFilter(type)}
                  style={activeFilter === type ? { background: stats.node_colors[type] } : {}}
                >
                  {type} ({stats.node_types[type]})
                </button>
              ))}
            </div>
          </div>

          <GraphView
            graphData={graphData}
            onNodeClick={handleNodeClick}
            highlightNodes={highlightNodes}
            nodeColors={stats?.node_colors || {}}
          />

          {stats && (
            <div className="graph-legend">
              {Object.entries(stats.node_colors).map(([type, color]) => (
                <div key={type} className="legend-item">
                  <div className="legend-dot" style={{ background: color }} />
                  {type}
                </div>
              ))}
            </div>
          )}

          {selectedNode && (
            <NodeDetail
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onNavigate={(nodeId) => {
                handleNodeClick(nodeId)
                handleExpandNode(nodeId)
              }}
            />
          )}
        </div>

        <ChatPanel
          apiBase={API_BASE}
          onHighlightNodes={handleHighlightNodes}
          onExpandNode={handleExpandNode}
        />
      </div>
    </div>
  )
}
