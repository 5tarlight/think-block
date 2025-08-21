import type { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'aiNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Input Layer', 
      nodeType: 'input',
      parameters: { shape: '[784]' }
    },
  },
  {
    id: '2',
    type: 'aiNode',
    position: { x: 300, y: 100 },
    data: { 
      label: 'Dense Layer', 
      nodeType: 'dense',
      parameters: { units: 128, activation: 'relu' }
    },
  },
  {
    id: '3',
    type: 'aiNode',
    position: { x: 500, y: 100 },
    data: { 
      label: 'Activation', 
      nodeType: 'activation',
      parameters: { function: 'ReLU' }
    },
  },
  {
    id: '4',
    type: 'aiNode',
    position: { x: 700, y: 100 },
    data: { 
      label: 'Dense Layer', 
      nodeType: 'dense',
      parameters: { units: 64, activation: 'relu' }
    },
  },
  {
    id: '5',
    type: 'aiNode',
    position: { x: 900, y: 100 },
    data: { 
      label: 'Output Layer', 
      nodeType: 'output',
      parameters: { units: 10, activation: 'softmax' }
    },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];