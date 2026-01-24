import React, { useState, useEffect } from "react";
import { itemsAPI, accessoriesAPI, categoriesAPI } from "../services/api";
import { Category, Item, Accessory } from "../types";
import { toast } from "sonner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newItem: Item | Accessory, type: "item" | "accessory") => void;
  type?: "item" | "accessory";
  initialData?: Item | Accessory | null;
}

const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onClose,
  onSuccess,
  type = "item",
  initialData = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (initialData) {
        setFormData({
          name: initialData.name,
          price:
            type === "item"
              ? (initialData as Item).price?.toString() || ""
              : "",
          category_id:
            type === "item"
              ? (initialData as Item).category_id?.toString() || ""
              : "",
        });
      } else {
        setFormData({ name: "", price: "", category_id: "" });
      }
    }
  }, [open, initialData, type]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isItem = type === "item";
      const api = isItem ? itemsAPI : accessoriesAPI;
      const data = isItem ? formData : { name: formData.name };

      let result;
      if (initialData?.id) {
        const res = await api.update(initialData.id, data);
        result = res.data;
        toast.success(`${isItem ? "Item" : "Accessory"} updated successfully`);
      } else {
        const res = await api.create(data);
        result = res.data;
        toast.success(
          `New ${isItem ? "Item" : "Accessory"} created successfully`,
        );
      }

      onSuccess(result, type);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save. Please check the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {initialData?.id ? "Edit" : "Add"}{" "}
        {type === "item" ? "Item" : "Accessory"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
            placeholder={
              type === "item"
                ? "e.g., Luxury Wedding Dress"
                : "e.g., Pearl Veil"
            }
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {type === "item" && (
            <>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={formData.category_id}
                  label="Category"
                  onChange={handleSelectChange}
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Select Category</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name_ar}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label="Price"
                name="price"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">OMR</InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{ borderRadius: 2, px: 4 }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ItemDialog;
