import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

interface AINodeData {
  label: string;
  nodeType: 'input' | 'dense' | 'activation' | 'output';
  parameters?: Record<string, string | number>;
}

export const AINode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const nodeData = data as unknown as AINodeData;
  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return '#4CAF50'; // Green
      case 'dense':
        return '#2196F3'; // Blue
      case 'activation':
        return '#FF9800'; // Orange
      case 'output':
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return '📥';
      case 'dense':
        return '🧠';
      case 'activation':
        return '⚡';
      case 'output':
        return '📤';
      default:
        return '🔲';
    }
  };

  const nodeStyle = {
    background: getNodeColor(nodeData.nodeType),
    color: 'white',
    border: '1px solid #222138',
    borderRadius: '8px',
    padding: '10px',
    minWidth: '120px',
    textAlign: 'center' as const,
    fontSize: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  return (
    <div style={nodeStyle}>
      {nodeData.nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ background: '#555' }}
        />
      )}
      
      <div>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>
          {getNodeIcon(nodeData.nodeType)}
        </div>
        <div style={{ fontWeight: 'bold' }}>
          {nodeData.label}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' }}>
          {nodeData.nodeType}
        </div>
        {nodeData.parameters && (
          <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
            {Object.entries(nodeData.parameters).map(([key, value]) => (
              <div key={key}>{key}: {String(value)}</div>
            ))}
          </div>
        )}
      </div>

      {nodeData.nodeType !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ background: '#555' }}
        />
      )}
    </div>
  );
};