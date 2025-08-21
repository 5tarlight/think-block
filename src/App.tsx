import NodeCanvas from './components/NodeCanvas'
import './App.css'

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Think Block</h1>
        <p>Visual AI Model Builder</p>
      </div>
      <NodeCanvas />
    </div>
  )
}

export default App
