import React, { useState } from "react";
import { Palette, Layers, Settings, X, LayoutGrid, List } from "lucide-react";

const ComponentItem = ({ id, content, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        onDragStart(id);
      }}
      className="bg-white p-3 mb-2 rounded shadow-sm border border-gray-200 cursor-move hover:border-blue-500"
    >
      {content}
    </div>
  );
};

const ReactBuilder = () => {
  const [components] = useState([
    { id: "1", type: "button", content: "Button" },
    { id: "2", type: "input", content: "Input Field" },
    { id: "3", type: "text", content: "Text Block" },
    { id: "4", type: "image", content: "Image" },
  ]);

  const [canvas, setCanvas] = useState([]);
  const [, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isGridView, setIsGridView] = useState(false);
  const [gridSize, setGridSize] = useState({ columns: 2, rows: 2 });

  const handleDragStart = (id) => {
    setDraggedItem(id);
  };

  const calculateGridPosition = (e, containerRect) => {
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    const cellWidth = containerRect.width / gridSize.columns;
    const cellHeight = containerRect.height / gridSize.rows;

    const column = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    return row * gridSize.columns + column;
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const droppedItemId = e.dataTransfer.getData("text/plain");
    const componentData = components.find((c) => c.id === droppedItemId);

    if (componentData) {
      const newItem = {
        ...componentData,
        id: `${componentData.id}-${Date.now()}`,
      };

      if (isGridView) {
        const containerRect = e.currentTarget.getBoundingClientRect();
        const gridPosition = calculateGridPosition(e, containerRect);

        setCanvas((prev) => {
          const newCanvas = [...prev];
          newCanvas[gridPosition] = newItem;
          return newCanvas;
        });
      } else {
        setCanvas((prev) => {
          const newCanvas = [...prev];
          newCanvas.splice(index, 0, newItem);
          return newCanvas;
        });
      }
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (isGridView) {
      const containerRect = e.currentTarget.getBoundingClientRect();
      const gridPosition = calculateGridPosition(e, containerRect);
      setDragOverIndex(gridPosition);
    } else {
      setDragOverIndex(index);
    }
  };

  const removeItem = (id) => {
    setCanvas((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDragStartCanvas = (e, index) => {
    e.dataTransfer.setData("canvasIndex", index);
    setDraggedItem(index);
  };

  const handleDropCanvas = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("canvasIndex"), 10);

    if (sourceIndex !== targetIndex) {
      setCanvas((prev) => {
        const newCanvas = [...prev];
        const [movedItem] = newCanvas.splice(sourceIndex, 1);
        newCanvas.splice(targetIndex, 0, movedItem);
        return newCanvas;
      });
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOverCanvas = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Components Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} className="text-blue-500" />
          <h2 className="font-semibold">Components</h2>
        </div>
        <div className="space-y-2">
          {components.map((component) => (
            <ComponentItem
              key={component.id}
              id={component.id}
              content={component.content}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-blue-500" />
              <h2 className="font-semibold">Canvas</h2>
            </div>
            <div className="flex gap-2">
              <button
                className={`p-2 rounded ${
                  isGridView ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => setIsGridView(true)}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                className={`p-2 rounded ${
                  !isGridView ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => setIsGridView(false)}
              >
                <List size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <div
            className={`min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg p-4 ${
              isGridView ? "grid gap-4" : ""
            }`}
            style={
              isGridView
                ? {
                    gridTemplateColumns: `repeat(${gridSize.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
                  }
                : {}
            }
            onDrop={(e) => handleDrop(e, canvas.length)}
            onDragOver={(e) => handleDragOver(e, canvas.length)}
          >
            {isGridView
              ? // Grid View
                Array.from({ length: gridSize.columns * gridSize.rows }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className={`aspect-square border-2 border-gray-100 rounded-lg p-2 ${
                        dragOverIndex === index ? "bg-blue-50" : ""
                      }`}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {canvas[index] && (
                        <div className="relative group h-full">
                          <div className="h-full bg-white p-3 rounded shadow-sm border border-gray-200">
                            {canvas[index].content}
                            <button
                              className="absolute top-2 right-2 p-1 rounded bg-red-50 text-red-500 opacity-0 group-hover:opacity-100"
                              onClick={() => removeItem(canvas[index].id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )
              : // List View
                canvas.map((item, index) => (
                  <div
                    key={item.id}
                    className={`relative group ${
                      dragOverIndex === index
                        ? "border-t-2 border-blue-500"
                        : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStartCanvas(e, index)}
                    onDragOver={(e) => handleDragOverCanvas(e, index)}
                    onDrop={(e) => handleDropCanvas(e, index)}
                  >
                    <div className="bg-white p-3 mb-2 rounded shadow-sm border border-gray-200">
                      {item.content}
                      <button
                        className="absolute top-2 right-2 p-1 rounded bg-red-50 text-red-500 opacity-0 group-hover:opacity-100"
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            {canvas.length === 0 && (
              <div className="text-center text-gray-400 py-8 col-span-full">
                Drag and drop components here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-blue-500" />
          <h2 className="font-semibold">Properties</h2>
        </div>
        {isGridView && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Grid Columns
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={gridSize.columns}
                onChange={(e) =>
                  setGridSize((prev) => ({
                    ...prev,
                    columns: parseInt(e.target.value),
                  }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Grid Rows
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={gridSize.rows}
                onChange={(e) =>
                  setGridSize((prev) => ({
                    ...prev,
                    rows: parseInt(e.target.value),
                  }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactBuilder;
