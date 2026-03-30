import { useRef, useCallback, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

/**
 * Interactive force-directed graph visualization.
 * Uses react-force-graph-2d for WebGL-accelerated rendering.
 * Nodes are colored by type and sized by connectivity.
 */
export default function GraphView({ graphData, onNodeClick, highlightNodes, nodeColors }) {
  const graphRef = useRef()

  // Zoom to fit on data change
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 60)
      }, 500)
    }
  }, [graphData])

  // Custom node rendering with labels
  const paintNode = useCallback((node, ctx, globalScale) => {
    const isHighlighted = highlightNodes.has(node.nodeId)
    const size = Math.max(4, Math.sqrt(node.val || 1) * 3)
    const fontSize = Math.max(10, 12 / globalScale)

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = node.color || '#999'
    ctx.fill()

    // Highlight ring
    if (isHighlighted) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Glow effect
      ctx.shadowColor = '#fff'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Draw label when zoomed in enough
    if (globalScale > 1.5) {
      const label = node.label || node.id || ''
      ctx.font = `${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = 'rgba(228, 230, 235, 0.9)'
      ctx.fillText(label, node.x, node.y + size + 2)
    }
  }, [highlightNodes])

  // Custom link rendering
  const paintLink = useCallback((link, ctx) => {
    ctx.strokeStyle = 'rgba(100, 110, 140, 0.2)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(link.source.x, link.source.y)
    ctx.lineTo(link.target.x, link.target.y)
    ctx.stroke()
  }, [])

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeId="nodeId"
      nodeCanvasObject={paintNode}
      nodePointerAreaPaint={(node, color, ctx) => {
        const size = Math.max(4, Math.sqrt(node.val || 1) * 3)
        ctx.beginPath()
        ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
      }}
      linkCanvasObject={paintLink}
      onNodeClick={(node) => onNodeClick(node.nodeId)}
      backgroundColor="#0f1117"
      cooldownTicks={100}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      enableNodeDrag={true}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  )
}
