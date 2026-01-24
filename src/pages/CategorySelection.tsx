import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoriesAPI, calendarAPI } from "../services/api";
import { getMonthName } from "../utils/dateHelpers";
import { Category } from "../types";

const CategorySelection = () => {
  const { monthId } = useParams<{ monthId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data || response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number | string) => {
    navigate(`/month/${monthId}/category/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading categories...</div>
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
          <p className="text-gray-600 mt-2">Select a category</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {category.name_en}
                </div>
                <div className="text-xl text-gray-600" dir="rtl">
                  {category.name_ar}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
