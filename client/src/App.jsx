import "./index.css";

export default function App() {
  return (
    <div className="bg-slate-600">
      <h1 className="text-red-900">dsfsdfsd</h1>
      <div className="bg-red-500 text-white p-4">Hello, Tailwind!</div>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Click Me
      </button>
      <div class="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          class="w-full h-48 object-cover"
          src="https://via.placeholder.com/300"
          alt="Image"
        />
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800">Card Title</h2>
          <p class="text-gray-600">
            This is a simple card component with Tailwind CSS.
          </p>
        </div>
      </div>
    </div>
  );
}
