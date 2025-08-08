import React from 'react';
import { BaseEntity } from '@/services/base-api';
import { ManagementLayout } from '@/components/ManagementLayout';
import { StatisticsCards, StatCardData } from '@/components/StatisticsCards';
import { DataTable, TableColumn, TableAction } from '@/components/DataTable';
import { UseEntityManagementReturn } from '@/hooks/useEntityManagement';

interface EntityViewProps<T extends BaseEntity, CreateData, UpdateData> {
  // Configuration
  config: {
    title: string;
    description: string;
    searchPlaceholder: string;
    emptyMessage: string;
  };
  
  // Business logic state and actions
  business: UseEntityManagementReturn<T, CreateData, UpdateData>;
  
  // Presentation data
  presentation: {
    statistics: StatCardData[];
    tableColumns: TableColumn<T>[];
    tableActions: TableAction<T>[];
  };
  
  // Dialog component
  DialogComponent: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    item: T | null;
    mode: 'create' | 'edit';
  }>;
}

export function EntityView<T extends BaseEntity, CreateData, UpdateData>({
  config,
  business,
  presentation,
  DialogComponent,
}: EntityViewProps<T, CreateData, UpdateData>) {
  const { data, loading, error, filters, meta, dialogState, actions } = business;
  const { statistics, tableColumns, tableActions } = presentation;

  return (
    <>
      {/* Statistics Cards */}
      <div className="p-4 md:p-8 pt-6">
        <StatisticsCards stats={statistics} />
      </div>

      {/* Management Layout with Table */}
      <ManagementLayout
        title={config.title}
        description={config.description}
        searchValue={filters.search}
        onSearchChange={actions.handleSearch}
        searchPlaceholder={config.searchPlaceholder}
        limit={filters.limit}
        onLimitChange={actions.handleLimitChange}
        onCreateClick={actions.openCreateDialog}
        onExportClick={actions.handleExport}
        error={error}
        onErrorDismiss={actions.resetError}
        loading={loading}
      >
        <DataTable
          data={data}
          columns={tableColumns}
          actions={tableActions}
          emptyMessage={config.emptyMessage}
          meta={meta}
          onPageChange={actions.handlePageChange}
        />
      </ManagementLayout>

      {/* Entity Dialog */}
      <DialogComponent
        isOpen={dialogState.isOpen}
        onClose={actions.closeDialog}
        onSubmit={dialogState.mode === "create" ? actions.handleCreate : actions.handleEdit}
        item={dialogState.editingItem}
        mode={dialogState.mode}
      />
    </>
  );
}
