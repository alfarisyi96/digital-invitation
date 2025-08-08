import { useState, useEffect, useCallback } from 'react';
import { BaseEntity, BaseApiService, PaginationParams, PaginationMeta } from '@/services/base-api';

export interface UseDataManagerConfig<T extends BaseEntity> {
  service: BaseApiService<T, any, any>;
  initialFilters?: Partial<PaginationParams>;
  autoFetch?: boolean;
}

export interface UseDataManagerReturn<T extends BaseEntity> {
  // State
  data: T[];
  loading: boolean;
  error: string | null;
  filters: PaginationParams;
  meta: PaginationMeta;
  
  // Actions
  fetchData: () => Promise<void>;
  createItem: (itemData: any) => Promise<void>;
  updateItem: (id: string, itemData: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PaginationParams>) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

export function useDataManager<T extends BaseEntity>({
  service,
  initialFilters = { page: 1, limit: 10, search: '' },
  autoFetch = true,
}: UseDataManagerConfig<T>): UseDataManagerReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    search: '',
    ...initialFilters,
  });
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await service.getAll(filters);
      
      if (response.success && response.data) {
        setData(response.data as T[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [service, filters]);

  const createItem = useCallback(async (itemData: any) => {
    try {
      const response = await service.create(itemData);
      if (response.success) {
        await fetchData(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to create item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
      throw err; // Re-throw to let the component handle it
    }
  }, [service, fetchData]);

  const updateItem = useCallback(async (id: string, itemData: any) => {
    try {
      const response = await service.update(id, itemData);
      if (response.success) {
        await fetchData(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to update item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
      throw err;
    }
  }, [service, fetchData]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const response = await service.delete(id);
      if (response.success) {
        await fetchData(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      throw err;
    }
  }, [service, fetchData]);

  const setFilters = useCallback((newFilters: Partial<PaginationParams>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    // State
    data,
    loading,
    error,
    filters,
    meta,
    
    // Actions
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    setFilters,
    setError,
    resetError,
  };
}
