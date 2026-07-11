import React from 'react';

function CategoryCard({ name, icon: Icon, image, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 group focus:outline-none text-left cursor-pointer"
    >
      {/* Background Image */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20 group-hover:via-black/55 group-hover:from-black/90 transition-all duration-300"></div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Top-Right Icon */}
        <div className="self-end w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 group-hover:bg-primary group-hover:border-transparent transition-all duration-300">
          <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
        </div>

        {/* Name and Action */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide font-sans mb-1">
            {name}
          </h3>
          <p className="text-secondary text-xs uppercase font-semibold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
            Browse Products &rarr;
          </p>
        </div>
      </div>

      {/* Decorative Border Layer */}
      <div className="absolute inset-0 border border-white/10 group-hover:border-primary/50 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </button>
  );
}

export default CategoryCard;
