import { useSidebarStore } from "../store/sidebarStore";

export default function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();

  return (
    <>
      {isOpen ? (
        // Expanded sidebar
        <div className="h-full w-64 bg-gray-100 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h2 className="font-semibold text-lg">Sidebar</h2>
            <button
              onClick={close}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Close sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Sidebar content will go here */}
          </div>
        </div>
      ) : (
        // Collapsed sidebar
        <div className="h-full w-8 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 transition-all duration-300 ease-in-out">
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-gray-200 mb-4"
            aria-label="Expand sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          {/* Icons for collapsed sidebar will go here */}
        </div>
      )}
    </>
  );
}
