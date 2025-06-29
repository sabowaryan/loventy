const BoltBadge = () => (
  <a
    href="https://bolt.new/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity"
  >
    <img
      src="/assets/badges/bolt-black-circle.svg"
      alt="Built with Bolt.new"
      className="h-6 w-6"
      draggable={false}
    />
    <span className="text-sm text-gray-600">Built with Bolt.new</span>
  </a>
);
