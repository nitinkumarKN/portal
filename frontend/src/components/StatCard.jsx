export default function StatCard({ icon, label, value, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-orange-100 text-orange-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
          {trend && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{trend}</p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 sm:ml-0 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
