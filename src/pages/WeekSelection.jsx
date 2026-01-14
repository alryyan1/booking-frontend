import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calendarAPI, categoriesAPI } from '../services/api';
import { getMonthName } from '../utils/dateHelpers';

const WeekSelection = () => {
  const { monthId, categoryId } = useParams();
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeksResponse, categoryResponse] = await Promise.all([
          calendarAPI.getWeeks(monthId, currentYear),
          categoriesAPI.getAll(),
        ]);

        setWeeks(weeksResponse.data.weeks);
        const foundCategory = categoryResponse.data.find((c) => c.id === parseInt(categoryId));
        setCategory(foundCategory);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthId, categoryId, currentYear]);

  const handleWeekClick = (weekNumber) => {
    navigate(`/month/${monthId}/category/${categoryId}/week/${weekNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading weeks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {getMonthName(parseInt(monthId))} {currentYear}
          </h1>
          {category && (
            <p className="text-xl text-gray-600 mt-2">
              {category.name_en} ({category.name_ar})
            </p>
          )}
          <p className="text-gray-600 mt-2">Select a week</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {weeks.map((week) => (
            <div
              key={week.week_number}
              onClick={() => handleWeekClick(week.week_number)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-indigo-500 min-w-[200px]"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  Week {week.week_number}
                </div>
                <div className="text-sm text-gray-600">
                  {week.start_date_formatted} - {week.end_date_formatted}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekSelection;

