import { useState, useEffect } from "react";
import { categoriesAPI } from "../services/api";
import CategoryForm from "../components/CategoryForm";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "categories") {
        const response = await categoriesAPI.getAll();
        setCategories((response.data as any).data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySave = async (formData) => {
    try {
      if (selectedCategory) {
        // await categoriesAPI.update(selectedCategory.id, formData);
        alert("Update not supported yet");
      } else {
        await categoriesAPI.create(formData);
      }
      setShowCategoryForm(false);
      setSelectedCategory(null);
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
      throw error;
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // await categoriesAPI.delete(id);
        alert("Delete not supported yet");
        fetchData();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(
          error.response?.data?.error ||
            "Error deleting category. Please try again.",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "categories"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Categories
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Categories
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowCategoryForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    + Add Category
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {category.name_en}
                            </h3>
                            <p className="text-sm text-gray-600" dir="rtl">
                              {category.name_ar}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowCategoryForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCategoryDelete(category.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showCategoryForm && (
          <CategoryForm
            category={selectedCategory}
            onSave={handleCategorySave}
            onCancel={() => {
              setShowCategoryForm(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
