import Sidebar from "./components/sidebar";

function App() {
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4">
        {/* Main content */}
        <h1 className="text-2xl font-bold">Main Content</h1>
      </div>
    </div>
  );
}

export default App;
