import React from 'react';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col items-center text-center">
      {/* Icon Wrapper */}
      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-6 transition-all duration-300">
        <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-accent mb-3 font-sans group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
