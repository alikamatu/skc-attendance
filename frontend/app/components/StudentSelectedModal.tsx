"use client"
import {motion} from 'framer-motion'
import React from "react";

interface StudentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: { id: number; name: string }[];
  onSelect: (id: number) => void;
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClose}
     className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select your Name</h2>
        <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
          {students.map((student) => (
            <li
              key={student.id}
              className="p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(student.id);
                onClose();
              }}
            >
              {student.name}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default StudentSelectionModal;