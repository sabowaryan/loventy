import React from 'react';

const BoltBadge: React.FC = () => (
  <a
    href="https://bolt.new/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Built with Bolt.new"
    className="inline-flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity"
  >
    <img
      src="/assets/badges/bolt-black-circle.svg"
      alt="Bolt.new Badge"
      className="h-6 w-6"
      draggable={false}
    />
    <span className="text-sm text-gray-600">Built with Bolt.new</span>
  </a>
);

export default BoltBadge;
