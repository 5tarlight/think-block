# Think Block

A visual node-based AI model builder inspired by Unreal Engine's Blueprint system. Create and configure AI models using an intuitive drag-and-drop interface.

## Features

- **Visual Node Editor**: Drag and drop nodes to build AI model architectures
- **AI-Specific Nodes**: Pre-built components for common AI model layers:
  - Input Layer (📥): Define data input shape
  - Dense Layer (🧠): Fully connected neural network layers
  - Activation Functions (⚡): Apply activation functions like ReLU, Sigmoid, etc.
  - Output Layer (📤): Define model outputs
- **Interactive Canvas**: Zoom, pan, and connect nodes with visual feedback
- **Real-time Updates**: See your model structure as you build it

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Usage

1. **Add Nodes**: Drag existing nodes around the canvas or add new ones
2. **Connect Nodes**: Click and drag from output handles (right side) to input handles (left side)
3. **Configure Parameters**: Each node shows its current parameters (units, activation, etc.)
4. **Navigate**: Use the mini-map and controls to navigate large model architectures

## Technology Stack

- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **@xyflow/react**: Professional node-based editor library
- **ESLint**: Code quality and consistency

## Architecture

- `src/components/NodeCanvas.tsx`: Main canvas component using ReactFlow
- `src/components/nodes/AINode.tsx`: Reusable AI node component
- `src/data/initialData.ts`: Sample node configuration and connections

## Contributing

This project uses ESLint for code quality. Make sure to run `npm run lint` before submitting changes.

## License

MIT
