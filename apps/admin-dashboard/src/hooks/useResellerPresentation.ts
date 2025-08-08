import { useMemo } from 'react';
import { Reseller } from '@/services/reseller-api';
import { StatCardData } from '@/components/StatisticsCards';
import { TableColumn, TableAction } from '@/components/DataTable';
import { calculateResellerStatistics } from '@/utils/reseller-statistics';
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";

export interface UseResellerPresentationProps {
  resellers: Reseller[];
  total: number;
  onEdit: (reseller: Reseller) => void;
  onDelete: (resellerId: string) => void;
}

export interface UseResellerPresentationReturn {
  statistics: StatCardData[];
  tableColumns: TableColumn<Reseller>[];
  tableActions: TableAction<Reseller>[];
}

export function useResellerPresentation({
  resellers,
  total,
  onEdit,
  onDelete,
}: UseResellerPresentationProps): UseResellerPresentationReturn {
  
  const statistics = useMemo(() => {
    return calculateResellerStatistics(resellers, total);
  }, [resellers, total]);

  const tableColumns = useMemo((): TableColumn<Reseller>[] => [
    {
      key: 'name',
      title: 'Reseller',
      render: (reseller) => (
        <div>
          <div className="font-medium">{reseller.name}</div>
          <div className="text-sm text-muted-foreground">{reseller.email}</div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (reseller) => (
        <Badge variant={reseller.type === 'PREMIUM' ? 'default' : 'secondary'}>
          {reseller.type}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (reseller) => (
        <Badge variant={reseller.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {reseller.status}
        </Badge>
      ),
    },
    {
      key: 'commission_rate',
      title: 'Commission',
      render: (reseller) => `${reseller.commission_rate}%`,
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (reseller) => new Date(reseller.created_at).toLocaleDateString(),
    },
  ], []);

  const tableActions = useMemo((): TableAction<Reseller>[] => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onEdit,
    },
    {
      label: 'Delete Reseller',
      icon: Trash2,
      onClick: (reseller) => onDelete(reseller.id),
      variant: 'destructive',
    },
  ], [onEdit, onDelete]);

  return {
    statistics,
    tableColumns,
    tableActions,
  };
}
