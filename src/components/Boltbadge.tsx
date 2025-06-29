import React from 'react';

const BoltBadge: React.FC = () => (
  <a
    href="https://bolt.new/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Built with Bolt.new"
    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
  >
    <img
      src="/assets/badges/bolt-black-circle.svg"
      alt="Bolt.new Badge"
      className="h-5 w-5"
      draggable={false}
    />
    <span className="text-xs font-medium">Built with Bolt.new</span>
  </a>
);

export default BoltBadge;
