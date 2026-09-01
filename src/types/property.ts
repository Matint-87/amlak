
export const PROPERTY_STATUSES = [
  "active",
  "sold",
  "rented",
  "cancelled",
  "under_construction",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

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

export type PropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => void;
  isEditing?: boolean;
  initialData?: PropertyRecord | null; 
};

export type PropertyRecord = {
  id: number;                
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
  slug: string;           
  status: PropertyStatus;
  is_featured: boolean;
  created_at: string;      
};