import { useMemo } from 'react';
import { BackendUser } from '@/types';
import { StatCardData } from '@/components/StatisticsCards';
import { TableColumn, TableAction } from '@/components/DataTable';
import { calculateUserStatistics } from '@/utils/user-statistics';
import { getUserTableColumns, getUserTableActions } from '@/utils/user-table-config';

export interface UseUserPresentationProps {
  users: BackendUser[];
  total: number;
  onEdit: (user: BackendUser) => void;
  onDelete: (userId: string) => void;
}

export interface UseUserPresentationReturn {
  statistics: StatCardData[];
  tableColumns: TableColumn<BackendUser>[];
  tableActions: TableAction<BackendUser>[];
}

export function useUserPresentation({
  users,
  total,
  onEdit,
  onDelete,
}: UseUserPresentationProps): UseUserPresentationReturn {
  
  // Calculate statistics - memoized for performance
  const statistics = useMemo(() => {
    return calculateUserStatistics(users, total);
  }, [users, total]);

  // Table configuration - memoized to prevent unnecessary re-renders
  const tableColumns = useMemo(() => {
    return getUserTableColumns();
  }, []);

  const tableActions = useMemo(() => {
    return getUserTableActions(onEdit, onDelete);
  }, [onEdit, onDelete]);

  return {
    statistics,
    tableColumns,
    tableActions,
  };
}
