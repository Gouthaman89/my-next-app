import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { motion } from "framer-motion";
import "../styles/app.css"; // Import the CSS file

const AnimatedPage = () => {
  const [boxCount, setBoxCount] = useState(0); // Number of boxes
  const [shapesInBoxes, setShapesInBoxes] = useState({}); // Track shapes in boxes
  const [shapePositions, setShapePositions] = useState({}); // Track positions of shapes
  const boxesRef = useRef([]); // References to box elements

  // Handle number input to create boxes
  const handleInputChange = (e) => {
    const count = parseInt(e.target.value, 10);
    if (!isNaN(count) && count >= 0) {
      setBoxCount(count);
      setShapesInBoxes({});
    }
  };
  const handleRemoveShape = (boxIndex, shapeId) => {
    setShapesInBoxes((prevShapes) => {
      const updatedBoxShapes = (prevShapes[boxIndex] || []).filter(
        (shape) => shape.id !== shapeId
      );
      return {
        ...prevShapes,
        [boxIndex]: updatedBoxShapes,
      };
    });
  };

  // Handle dropping a shape onto a box
  const handleShapeDrop = (shapeId, shapeType, event) => {
    const dropX = event.clientX;
    const dropY = event.clientY;

    boxesRef.current.forEach((box, index) => {
      if (box) {
        const rect = box.getBoundingClientRect();
        if (
          dropX >= rect.left &&
          dropX <= rect.right &&
          dropY >= rect.top &&
          dropY <= rect.bottom
        ) {
          setShapesInBoxes((prevShapes) => {
            const boxShapes = prevShapes[index] || [];
            if (boxShapes.find((shape) => shape.id === shapeId)) {
              return prevShapes; // Do not add duplicate
            }
            return {
              ...prevShapes,
              [index]: [...boxShapes, { id: shapeId, type: shapeType }],
            };
          });
        }
      }
    });
  };

  // Handle shape dragging
  const handleDrag = (shapeId, e, data) => {
    setShapePositions((prevPositions) => ({
      ...prevPositions,
      [shapeId]: { x: data.x, y: data.y },
    }));
  };

  // Generate unique shapes with IDs and initial positions
  const generateShapes = (type, count, startX, startY, spacing) => {
    return Array.from({ length: count }).map((_, index) => {
      const id = `${type}-${index + 1}`;
      const x = startX + (index % 5) * spacing; // Row-wise arrangement
      const y = startY + Math.floor(index / 5) * spacing; // Move down every 5 items
      shapePositions[id] = { x, y }; // Set initial position
      return { id, type };
    });
  };

  const circles = generateShapes("circle", 10, 20, 20, 60); // Start at (20, 20), 60px spacing
  const triangles = generateShapes("triangle", 10, 0, 0, 60); // Start below the circles

  // Initialize the positions only once when the component mounts
  useEffect(() => {
    setShapePositions((prevPositions) => ({ ...prevPositions }));
  }, []);

  return (
    <div className="container">
      {/* Input Field */}
      <div className="input-field">
        <label className="input-label">Enter number of Station:</label>
        <input
          type="number"
          min="0"
          onChange={handleInputChange}
          className="input-box"
        />
      </div>
      <div className="draggable-shapes-area">
      {triangles.map((triangle) => (
  <Draggable
    key={triangle.id}
    position={shapePositions[triangle.id] || triangle.position}
    onDrag={(e, data) => handleDrag(triangle.id, e, data)}
    onStop={(e, data) => handleShapeDrop(triangle.id, "triangle", e)}
  >
    <motion.div className="draggable-triangle">
      <span className="triangle-number">
        {triangle.id.split("-")[1]}
      </span>
    </motion.div>
  </Draggable>
))}
      </div>
      {/* Center Line with Boxes */}
      <div className="center-line-container">
        <motion.div
          className="center-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Boxes */}
        <div className="boxes-container">
  {Array.from({ length: boxCount }).map((_, index) => (
    <motion.div
      key={index}
      ref={(el) => (boxesRef.current[index] = el)}
      className="box"
      style={{
        width: `${50 + (shapesInBoxes[index]?.length || 0) * 20}px`,
        height: `${50 + (shapesInBoxes[index]?.length || 0) * 20}px`,
        margin: "10px", // Spacing between boxes
      }}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {shapesInBoxes[index] &&
        shapesInBoxes[index].map((shape) => (
          <div key={shape.id} className="shape-in-box">
            {shape.type === "circle" ? (
  <div className="circle">
    {shape.id.split("-")[1]}
    <button
      className="remove-shape-button"
      onClick={() => handleRemoveShape(index, shape.id)}
    >
      ✖
    </button>
  </div>
) : (
  <div className="triangle">
    <span className="triangle-number">{shape.id.split("-")[1]}</span>
    <button
      className="remove-shape-button"
      onClick={() => handleRemoveShape(index, shape.id)}
    >
      ✖
    </button>
  </div>
)}
          </div>
        ))}
    </motion.div>
  ))}
</div>
      </div>

      {/* Draggable Shapes */}
      <div className="draggable-shapes-area">
        {circles.map((circle) => (
          <Draggable
            key={circle.id}
            position={shapePositions[circle.id] || { x: 0, y: 0 }}
            onDrag={(e, data) => handleDrag(circle.id, e, data)}
            onStop={(e, data) => handleShapeDrop(circle.id, "circle", e)}
          >
            <motion.div className="draggable-circle">
              {circle.id.split("-")[1]}
            </motion.div>
          </Draggable>
        ))}
        </div>
        <div className="draggable-shapes-area">
        {circles.map((circle) => (
          <Draggable
            key={circle.id}
            position={shapePositions[circle.id] || { x: 0, y: 0 }}
            onDrag={(e, data) => handleDrag(circle.id, e, data)}
            onStop={(e, data) => handleShapeDrop(circle.id, "circle", e)}
          >
            <motion.div className="draggable-circle">
              {circle.id.split("-")[1]}
            </motion.div>
          </Draggable>
        ))}
        </div>
        
    </div>
  );
};

export default AnimatedPage;