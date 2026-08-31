// types/property.ts

export const PROPERTY_STATUSES = [
  "active",
  "sold",
  "rented",
  "cancelled",
  "under_construction",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

// داده‌ای که از فرم می‌آید (برای submit)
export type PropertyFormData = {
  type: string;
  title: string;
  address?: string | null;
  description?: string | null;
  phone?: string | null;
  price?: number | null;
  rent?: number | null;
  deposit?: number | null;
  images?: string[];
  meter?: number | null;
  status?: PropertyStatus;
  is_featured?: boolean;
};

// وضعیت فرم داخل کامپوننت (همه فیلدها مقدار پیش‌فرض دارند)
export type PropertyFormState = {
  type: string;
  title: string;
  address: string;
  description: string;
  phone: string;
  price: number | null;
  rent: number | null;
  deposit: number | null;
  meter: number | null;
  images: string[];
  status: PropertyStatus;
  is_featured: boolean;
};

// Props کامپوننت PropertyModal
export type PropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => void;
  isEditing?: boolean;
  initialData?: PropertyRecord | null; // اینجا PropertyRecord بهتره تا id داشته باشه
};

// رکورد واقعی دیتابیس با id و created_at
export type PropertyRecord = {
  id: number;                  // کلید اصلی جدول
  type: string;
  title: string;
  address: string | null;
  description: string | null;
  phone: string | null;
  price: number | null;
  rent: number | null;
  deposit: number | null;
  meter: number | null;
  images: string[];
  slug: string;                // برای URL
  status: PropertyStatus;
  is_featured: boolean;
  created_at: string;          // ISO date string
};