import { useNavigate } from 'react-router-dom';
import { getMonthName } from '../utils/dateHelpers';

const MonthlyOverview = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleMonthClick = (monthId) => {
    navigate(`/month/${monthId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management System</h1>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl text-gray-700">Select a Month - {currentYear}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month) => (
            <div
              key={month}
              onClick={() => handleMonthClick(month)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{month}</div>
                <div className="text-lg font-semibold text-gray-800">
                  {getMonthName(month)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverview;

