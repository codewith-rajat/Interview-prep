export function EmptyState({ icon, title, description, action, actionText }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 md:p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && actionText && (
        <button
          onClick={action}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2 rounded-lg font-semibold transition inline-block"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
