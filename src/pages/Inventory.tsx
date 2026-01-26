import { useState, useEffect } from "react";
import {
  Package,
  Tags,
  FolderOpen,
  TrendingUp,
  Plus,
  Search,
  LayoutGrid,
  Pencil,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Stack, Typography } from "@mui/material";
import ItemDialog from "../components/ItemDialog";
import { itemsAPI, accessoriesAPI, categoriesAPI } from "../services/api";
import { Item, Accessory, Category } from "@/types";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Items, 1 = Accessories
  const [items, setItems] = useState<Item[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    id?: number;
    type: string;
    // We add other item properties to satisfy type checks if needed, but for now `any` or strict types.
    // Casting in handleOpenModal covers it.
    name?: string;
    price?: number | string;
    category_id?: number | string;
  } | null>(null);

  // loading state for fetching data, but handleSubmit loading is now in ItemDialog
  // We keep loading for fetchData?
  // const [loading, setLoading] = useState(false); // Used in fetchData? No, fetching doesn't seem to use loading state explicitly in provided code snippet for table, only modal did. Check fetchData...
  // Actually fetchData does not use loading state in the provided code snippet (only setAccessories etc). The modal used it.
  // We can remove loading state if it was only for the modal.

  // Notification State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, accessoriesRes, categoriesRes] = await Promise.all([
        itemsAPI.getAll(),
        accessoriesAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setItems(itemsRes.data.data || itemsRes.data || []);
      setAccessories(accessoriesRes.data.data || accessoriesRes.data || []);
      setCategories(categoriesRes.data.data || categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showToast("Failed to load inventory data", "error");
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleOpenModal = (item: any = null, type = "item") => {
    if (item) {
      // Just set the item, ItemDialog handles the rest
      setCurrentItem({ ...item, type });
    } else {
      setCurrentItem({ type });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
  };

  const handleSuccess = async (newItem: any, type: string) => {
    await fetchData();
    // Toast is handled in ItemDialog for success, but we can also do it here if we want global.
    // ItemDialog does it.
  };

  const handleDelete = async (id: number, type: string) => {
    showToast("Delete is disabled to preserve history.", "info");
  };

  // Removed handleChange, handleSubmit as they are in ItemDialog now

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category_id === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const filteredAccessories = accessories.filter((acc) =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentData = activeTab === 0 ? filteredItems : filteredAccessories;
  const currentType = activeTab === 0 ? "item" : "accessory";

  // Stats for the top cards
  const stats = [
    {
      label: "Total Items",
      value: items.length,
      icon: <Package className="h-4 w-4 text-slate-500" />,
    },
    {
      label: "Accessories",
      value: accessories.length,
      icon: <Tags className="h-4 w-4 text-slate-500" />,
    },
    {
      label: "Categories",
      value: categories.length,
      icon: <FolderOpen className="h-4 w-4 text-slate-500" />,
    },
    {
      label: "Total Value",
      value: `OMR ${items.reduce((sum: number, item: any) => sum + parseFloat(item.price || 0), 0).toFixed(2)}`,
      icon: <TrendingUp className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="p-2 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : toast.type === "info"
                ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Management
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal(null, currentType)}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab === 0 ? "Item" : "Accessory"}
        </button>
      </div>

      {/* Stats Cards */}

      {/* Main Content */}
      <div className="">
        {/* Tabs */}
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          <div className="inline-flex h-10 items-center justify-center rounded-md  p-1 text-slate-500 w-fit">
            <Stack
              direction="row"
              spacing={2}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <div>
                {" "}
                <button
                  onClick={() => setActiveTab(0)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === 0
                      ? "bg-white text-slate-950 shadow-sm"
                      : "hover:text-slate-950"
                  }`}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Items Catalog
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === 1
                      ? "bg-white text-slate-950 shadow-sm"
                      : "hover:text-slate-950"
                  }`}
                >
                  <Tags className="mr-2 h-4 w-4" />
                  Accessories
                </button>
              </div>
              <div>
                {activeTab === 0 && (
                  <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-slate-100 ">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        selectedCategory === null
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          selectedCategory === category.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {category.name_ar}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Stack>
          </div>
        </div>

        {/* Categories Row */}

        {/* Search & Toolbar */}
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 0 ? "items" : "accessories"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto border-t border-slate-200">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-slate-50/50">
              <tr className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  Name
                </th>
                {activeTab === 0 && (
                  <>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                      Category
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">
                      Price
                    </th>
                  </>
                )}
                <th className="h-12 px-4 text-right align-middle font-medium text-slate-500 w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr]:border-b">
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 0 ? 3 : 2}
                    className="p-4 align-middle text-center h-48"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <LayoutGrid className="h-12 w-12 text-slate-300" />
                      <p className="text-lg font-medium text-slate-900">
                        No results found
                      </p>
                      <p className="text-sm text-slate-500">
                        {searchQuery
                          ? `No matches for "${searchQuery}"`
                          : "Get started by creating a new record"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center h-9 w-9 rounded-lg border text-xs font-bold ${
                            activeTab === 0
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : "bg-purple-50 text-purple-700 border-purple-100"
                          }`}
                        >
                          {row.id}
                        </div>
                        <div className="text-lg font-medium text-slate-900">
                          {row.name}
                        </div>
                      </div>
                    </td>
                    {activeTab === 0 && (
                      <>
                        <td className="p-4 align-middle">
                          <span className="text-lg px-2 py-1 rounded-md">
                            {(row as Item).category?.name_ar || "Uncategorized"}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 border-transparent bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80">
                            OMR{" "}
                            {parseFloat((row as Item).price as string).toFixed(
                              2,
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(row, currentType)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(row.id, currentType)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 cursor-not-allowed opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal/Dialog Overlay */}
      {/* Custom Modal/Dialog Overlay is replaced by ItemDialog */}
      <ItemDialog
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        type={currentType as "item" | "accessory"}
        initialData={currentItem as Item | Accessory}
      />
    </div>
  );
};

export default Inventory;
