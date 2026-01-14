import { useState, useEffect } from 'react';
import { categoriesAPI, timeSlotsAPI } from '../services/api';
import CategoryForm from '../components/CategoryForm';
import TimeSlotForm from '../components/TimeSlotForm';
import { formatTime } from '../utils/dateHelpers';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bulkTimeSlotData, setBulkTimeSlotData] = useState({
    start_hour: 9,
    end_hour: 17,
    interval: 60,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'categories') {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } else if (activeTab === 'time-slots') {
        const response = await timeSlotsAPI.getAll();
        setTimeSlots(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySave = async (formData) => {
    try {
      if (selectedCategory) {
        await categoriesAPI.update(selectedCategory.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      setShowCategoryForm(false);
      setSelectedCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.error || 'Error deleting category. Please try again.');
      }
    }
  };

  const handleTimeSlotSave = async (formData) => {
    try {
      if (selectedTimeSlot) {
        await timeSlotsAPI.update(selectedTimeSlot.id, formData);
      } else {
        await timeSlotsAPI.create(formData);
      }
      setShowTimeSlotForm(false);
      setSelectedTimeSlot(null);
      fetchData();
    } catch (error) {
      console.error('Error saving time slot:', error);
      throw error;
    }
  };

  const handleTimeSlotDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await timeSlotsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting time slot:', error);
        alert(error.response?.data?.error || 'Error deleting time slot. Please try again.');
      }
    }
  };

  const handleBulkCreate = async () => {
    if (window.confirm(`Create time slots from ${bulkTimeSlotData.start_hour}:00 to ${bulkTimeSlotData.end_hour}:00 with ${bulkTimeSlotData.interval} minute intervals?`)) {
      try {
        await timeSlotsAPI.bulkCreate(bulkTimeSlotData);
        alert('Time slots created successfully!');
        fetchData();
      } catch (error) {
        console.error('Error creating bulk time slots:', error);
        alert('Error creating time slots. Please try again.');
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
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'categories'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('time-slots')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'time-slots'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Time Slots
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Categories</h2>
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
                            <h3 className="font-semibold text-gray-900">{category.name_en}</h3>
                            <p className="text-sm text-gray-600" dir="rtl">{category.name_ar}</p>
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

            {/* Time Slots Tab */}
            {activeTab === 'time-slots' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Time Slots</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTimeSlot(null);
                        setShowTimeSlotForm(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      + Add Time Slot
                    </button>
                  </div>
                </div>

                {/* Bulk Create */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Bulk Create Time Slots</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={bulkTimeSlotData.start_hour}
                        onChange={(e) => setBulkTimeSlotData(prev => ({ ...prev, start_hour: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Hour</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={bulkTimeSlotData.end_hour}
                        onChange={(e) => setBulkTimeSlotData(prev => ({ ...prev, end_hour: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interval (minutes)</label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        value={bulkTimeSlotData.interval}
                        onChange={(e) => setBulkTimeSlotData(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleBulkCreate}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Bulk Create
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg p-4 border ${
                          slot.is_active
                            ? 'bg-white border-gray-200'
                            : 'bg-gray-100 border-gray-300 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {slot.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedTimeSlot(slot);
                                setShowTimeSlotForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleTimeSlotDelete(slot.id)}
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

        {showTimeSlotForm && (
          <TimeSlotForm
            timeSlot={selectedTimeSlot}
            onSave={handleTimeSlotSave}
            onCancel={() => {
              setShowTimeSlotForm(false);
              setSelectedTimeSlot(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;

