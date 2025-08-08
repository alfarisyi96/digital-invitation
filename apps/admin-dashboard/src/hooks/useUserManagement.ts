import { BackendUser } from '@/types';
import { userApiService, CreateUserData, UpdateUserData } from '@/services/user-api';
import { useEntityManagement, UseEntityManagementReturn } from '@/hooks/useEntityManagement';

export type UseUserManagementReturn = UseEntityManagementReturn<BackendUser, CreateUserData, UpdateUserData>;

export function useUserManagement(): UseUserManagementReturn {
  return useEntityManagement({
    service: userApiService,
    confirmDeleteMessage: 'Are you sure you want to delete this user?',
    onExport: (users, filters) => {
      // User-specific export logic
      console.log('Exporting users...', { count: users.length, filters });
      // Could implement CSV/Excel export here
    },
  });
}
