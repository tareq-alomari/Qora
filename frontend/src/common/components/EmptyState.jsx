export default function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
      <div className="text-5xl mb-4">{icon}</div>
      {title && <p className="text-gray-700 text-lg mb-2">{title}</p>}
      {description && <p className="text-gray-400 mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
