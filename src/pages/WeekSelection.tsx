import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { calendarAPI, categoriesAPI } from "../services/api";
import { getMonthName } from "../utils/dateHelpers";

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
          calendarAPI.getWeeks(monthId, currentYear, categoryId),
          categoriesAPI.getAll(),
        ]);

        setWeeks(weeksResponse.data.weeks);
        const foundCategory = categoryResponse.data.data.find(
          (c: any) => c.id === parseInt(categoryId || "0"),
        );
        setCategory(foundCategory);
      } catch (error) {
        console.error("Error fetching data:", error);
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
            {getMonthName(parseInt(monthId || "0"))} {currentYear}
          </h1>
          {category && (
            <p className="text-xl text-gray-600 mt-2">
              {category.name_en} ({category.name_ar})
            </p>
          )}
          <p className="text-gray-600 mt-2">Select a week</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {weeks.map((week: any) => {
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const isCurrentWeek =
              today >= week.start_date && today <= week.end_date;

            return (
              <div
                key={week.week_number}
                onClick={() => handleWeekClick(week.week_number)}
                className={`rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 min-w-[200px] relative ${
                  isCurrentWeek
                    ? "bg-indigo-50 border-indigo-600 ring-4 ring-indigo-100 scale-105"
                    : "bg-white border-transparent hover:border-indigo-500"
                }`}
              >
                <div className="text-center">
                  {isCurrentWeek && (
                    <div className="absolute top-0 right-0 left-0 -mt-3 flex justify-center">
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                        Current Week
                      </span>
                    </div>
                  )}
                  <div
                    className={`text-2xl font-bold mb-2 ${isCurrentWeek ? "text-indigo-800" : "text-indigo-600"}`}
                  >
                    Week {week.week_number}
                  </div>
                  <div
                    className={`text-sm ${isCurrentWeek ? "text-indigo-700" : "text-gray-600"}`}
                  >
                    {week.start_date_formatted} - {week.end_date_formatted}
                  </div>
                  {week.booking_count > 0 && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isCurrentWeek
                            ? "bg-indigo-200 text-indigo-900"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {week.booking_count} Bookings
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekSelection;
