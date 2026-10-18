import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'royal-gradient text-white border-transparent shadow-md'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-purple/40 hover:bg-neutral-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
