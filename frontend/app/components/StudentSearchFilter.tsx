import React from "react";

interface StudentSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const StudentSearchFilter: React.FC<StudentSearchFilterProps> = ({ searchTerm, setSearchTerm }) => {
  console.log("Search term:", searchTerm); // Debugging the search term
  return (
    <div className="my-4">
      <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Search Students</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name..."
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default StudentSearchFilter;