"use client";

import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserPresentation } from "@/hooks/useUserPresentation";
import { UsersView } from "@/components/UsersView";

export default function UsersPage() {
  // Business logic layer
  const business = useUserManagement();
  
  // Presentation logic layer
  const presentation = useUserPresentation({
    users: business.data,
    total: business.meta.total,
    onEdit: business.actions.openEditDialog,
    onDelete: business.actions.handleDelete,
  });

  // Pure orchestration - no business logic or view logic here
  return <UsersView business={business} presentation={presentation} />;
}
