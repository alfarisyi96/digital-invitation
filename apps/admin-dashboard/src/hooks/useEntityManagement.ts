import { useState, useCallback } from 'react';
import { BaseEntity, BaseApiService } from '@/services/base-api';
import { useDataManager } from '@/hooks/useDataManager';

export interface UseEntityManagementConfig<T extends BaseEntity, CreateData, UpdateData> {
  service: BaseApiService<T, CreateData, UpdateData>;
  confirmDeleteMessage?: string;
  onExport?: (data: T[], filters: any) => void;
}

export interface UseEntityManagementReturn<T extends BaseEntity, CreateData, UpdateData> {
  // Data state
  data: T[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    page: number;
    limit: number;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Dialog state
  dialogState: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editingItem: T | null;
  };
  
  // Actions
  actions: {
    // Data actions
    handleSearch: (value: string) => void;
    handleLimitChange: (limit: number) => void;
    handlePageChange: (page: number) => void;
    handleCreate: (data: CreateData) => Promise<void>;
    handleEdit: (data: UpdateData) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleExport: () => void;
    
    // Dialog actions
    openCreateDialog: () => void;
    openEditDialog: (item: T) => void;
    closeDialog: () => void;
    
    // Error actions
    resetError: () => void;
  };
}

export function useEntityManagement<T extends BaseEntity, CreateData, UpdateData>({
  service,
  confirmDeleteMessage = 'Are you sure you want to delete this item?',
  onExport,
}: UseEntityManagementConfig<T, CreateData, UpdateData>): UseEntityManagementReturn<T, CreateData, UpdateData> {
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  // Data management
  const {
    data,
    loading,
    error,
    filters,
    meta,
    createItem,
    updateItem,
    deleteItem,
    setFilters,
    resetError,
  } = useDataManager({
    service,
    initialFilters: { page: 1, limit: 10, search: '' },
  });

  // Business logic actions
  const handleSearch = useCallback((value: string) => {
    setFilters({ search: value, page: 1 });
  }, [setFilters]);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters({ limit, page: 1 });
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(confirmDeleteMessage)) return;
    
    try {
      await deleteItem(id);
    } catch (err: any) {
      // Error is already handled by useDataManager
    }
  }, [deleteItem, confirmDeleteMessage]);

  const handleCreate = useCallback(async (itemData: CreateData) => {
    try {
      await createItem(itemData);
      setDialogOpen(false);
    } catch (err: any) {
      throw err; // Re-throw to let the dialog handle it
    }
  }, [createItem]);

  const handleEdit = useCallback(async (itemData: UpdateData) => {
    if (!editingItem) return;
    
    try {
      await updateItem(editingItem.id, itemData);
      setDialogOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      throw err;
    }
  }, [editingItem, updateItem]);

  const openCreateDialog = useCallback(() => {
    setDialogMode("create");
    setEditingItem(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: T) => {
    setDialogMode("edit");
    setEditingItem(item);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
  }, []);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(data, filters);
    } else {
      console.log('Export functionality not implemented');
    }
  }, [data, filters, onExport]);

  return {
    // Data state
    data,
    loading,
    error,
    filters: {
      search: filters.search || '',
      page: filters.page,
      limit: filters.limit,
    },
    meta,
    
    // Dialog state
    dialogState: {
      isOpen: dialogOpen,
      mode: dialogMode,
      editingItem,
    },
    
    // Actions
    actions: {
      // Data actions
      handleSearch,
      handleLimitChange,
      handlePageChange,
      handleCreate,
      handleEdit,
      handleDelete,
      handleExport,
      
      // Dialog actions
      openCreateDialog,
      openEditDialog,
      closeDialog,
      
      // Error actions
      resetError,
    },
  };
}
