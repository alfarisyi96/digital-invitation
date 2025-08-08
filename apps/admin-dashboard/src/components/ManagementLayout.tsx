import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Plus } from "lucide-react";

export interface ManagementLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  
  // Search and filters
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Pagination
  limit: number;
  onLimitChange: (limit: number) => void;
  
  // Actions
  onCreateClick: () => void;
  onExportClick?: () => void;
  
  // Error handling
  error?: string | null;
  onErrorDismiss?: () => void;
  
  // Loading state
  loading?: boolean;
  
  // Additional filters
  additionalFilters?: React.ReactNode;
}

export function ManagementLayout({
  title,
  description,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  limit,
  onLimitChange,
  onCreateClick,
  onExportClick,
  error,
  onErrorDismiss,
  loading = false,
  additionalFilters,
}: ManagementLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center space-x-2">
          {onExportClick && (
            <Button variant="outline" size="sm" onClick={onExportClick}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>{title} Management</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select 
              value={limit.toString()} 
              onValueChange={(value: string) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
            
            {additionalFilters}
            
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/15 border border-destructive text-destructive rounded-md flex items-center justify-between">
              <span>{error}</span>
              {onErrorDismiss && (
                <Button variant="ghost" size="sm" onClick={onErrorDismiss}>
                  ×
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
