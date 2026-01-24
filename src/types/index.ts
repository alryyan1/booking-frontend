export interface Customer {
  id: number;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  role?: string;
}

export interface Item {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  category_id?: number;
  category?: Category;
}

export interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
}

export interface Accessory {
  id: number;
  name: string;
}

export interface BookingItem {
  id: number;
  db_id?: number | null;
  item_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: number;
  invoice_number: string;
  customer_id: number | string;
  phone_number: string;
  notes?: string;
  event_date: string;
  booking_date: string;
  deposit_amount: string | number;
  total_amount: string | number;
  remaining_balance: string | number;
  pickup_date: string;
  payment_method: string;
  delivered: boolean;
  delivered_at?: string;
  returned: boolean;
  returned_at?: string;
  customer?: Customer;
  items?: any[]; // Replaced BookingItem[] with any[] temporarily if structure is complex
  accessories?: Accessory[];
  rented_accessories?: Accessory[];
  payment_amount?: string | number;
  user?: { id: number; name: string };
  delivered_by_user?: { id: number; name: string };
}

export interface DashboardStats {
  bookings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
    partial: number;
  };
  bookings_by_status: {
    pending: number;
    partial: number;
    paid: number;
  };
}
