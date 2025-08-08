import React from 'react';
import { BackendUser } from '@/types';
import { TableColumn, TableAction } from '@/components/DataTable';
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";

export function getUserTableColumns(): TableColumn<BackendUser>[] {
  return [
    {
      key: 'user',
      title: 'User',
      render: (user) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          {user.phone && (
            <div className="text-sm text-muted-foreground">{user.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'reseller',
      title: 'Reseller Status',
      render: (user) => (
        user.reseller ? (
          <Badge variant={user.reseller.type === 'PREMIUM' ? 'default' : 'secondary'}>
            {user.reseller.type}
          </Badge>
        ) : (
          <span className="text-muted-foreground">No reseller</span>
        )
      ),
    },
    {
      key: 'invites',
      title: 'Invitations',
      render: (user) => (
        <div className="text-sm">
          {user.invites?.length || 0} invitations
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Joined',
      render: (user) => formatDate(user.created_at),
    },
  ];
}

export function getUserTableActions(
  onEdit: (user: BackendUser) => void,
  onDelete: (userId: string) => void
): TableAction<BackendUser>[] {
  return [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onEdit,
    },
    {
      label: 'Delete User',
      icon: Trash2,
      onClick: (user) => onDelete(user.id),
      variant: 'destructive',
    },
  ];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
