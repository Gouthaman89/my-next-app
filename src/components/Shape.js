import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import React from 'react';

const Shape = ({ shape, isDragging, style, onRemove }) => {
  const shapeVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1 },
    drag: { scale: 1.2, opacity: 0.8 },
  };

  const machineVariants = {
    idle: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 2 } },
    hover: { scale: 1.1 },
  };

  const humanVariants = {
    idle: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 1.5 } },
    hover: { scale: 1.1 },
  };

  // Render Circle as Machine
  if (shape.type === 'circle') {
    return (
      <motion.div
        className="relative"
        variants={shapeVariants}
        initial="idle"
        animate={isDragging ? 'drag' : 'idle'}
        whileHover="hover"
        style={style}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg flex items-center justify-center"
          variants={machineVariants}
          animate="idle"
          whileHover="hover"
        >
          <Bot className="w-6 h-6 text-white" />
        </motion.div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </motion.div>
    );
  }

  // Render Triangle as Human
  if (shape.type === 'triangle') {
    return (
      <motion.div
        className="relative"
        variants={shapeVariants}
        initial="idle"
        animate={isDragging ? 'drag' : 'idle'}
        whileHover="hover"
        style={style}
      >
        <motion.div
          className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[48px] border-b-amber-500 bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg flex items-center justify-center"
          variants={humanVariants}
          animate="idle"
          whileHover="hover"
        >
          <User className="w-6 h-6 text-white" />
        </motion.div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </motion.div>
    );
  }

  return null; // Fallback for unsupported shapes
};

export default Shape;