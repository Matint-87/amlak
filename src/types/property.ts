// types/property.ts

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
  created_at: string;          // ISO date string
};
