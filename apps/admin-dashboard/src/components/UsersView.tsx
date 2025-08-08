import React from 'react';
import { BackendUser } from '@/types';
import { UserDialog } from '@/components/UserDialog';
import { EntityView } from '@/components/EntityView';
import { CreateUserData, UpdateUserData } from '@/services/user-api';
import { UseUserManagementReturn } from '@/hooks/useUserManagement';
import { UseUserPresentationReturn } from '@/hooks/useUserPresentation';

interface UsersViewProps {
  // Business logic state and actions
  business: UseUserManagementReturn;
  
  // Presentation data
  presentation: UseUserPresentationReturn;
}

export function UsersView({ business, presentation }: UsersViewProps) {
  return (
    <EntityView
      config={{
        title: "Users",
        description: "View and manage all users in the system",
        searchPlaceholder: "Search users by name or email...",
        emptyMessage: "No users found.",
      }}
      business={business}
      presentation={presentation}
      DialogComponent={UserDialog}
    />
  );
}
