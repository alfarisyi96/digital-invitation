import { Reseller, CreateResellerData, UpdateResellerData, resellerApiService } from '@/services/reseller-api';
import { useEntityManagement, UseEntityManagementReturn } from '@/hooks/useEntityManagement';

export type UseResellerManagementReturn = UseEntityManagementReturn<Reseller, CreateResellerData, UpdateResellerData>;

export function useResellerManagement(): UseResellerManagementReturn {
  return useEntityManagement({
    service: resellerApiService,
    confirmDeleteMessage: 'Are you sure you want to delete this reseller?',
    onExport: (resellers, filters) => {
      console.log('Exporting resellers...', { count: resellers.length, filters });
      // Reseller-specific export logic
    },
  });
}
