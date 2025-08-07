"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Reseller, ResellerFilters, ApiResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search,
  Users,
  Crown,
  Link,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResellerFilters>({
    page: 1,
    limit: 10,
    type: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchResellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getResellers(filters);
      
      if (response.success && response.data) {
        setResellers(response.data as Reseller[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        setError(response.message || 'Failed to fetch resellers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, [filters]);

  const handleDeleteReseller = async (resellerId: string) => {
    if (!confirm('Are you sure you want to delete this reseller?')) return;
    
    try {
      await apiClient.deleteReseller(resellerId);
      fetchResellers(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete reseller');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const stats = {
    total: meta.total,
    premium: resellers.filter(reseller => reseller.type === 'PREMIUM').length,
    free: resellers.filter(reseller => reseller.type === 'FREE').length,
    totalReferred: resellers.reduce((sum, reseller) => sum + reseller.total_referred, 0),
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Resellers</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Reseller
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active reseller accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Resellers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.premium / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
            <p className="text-xs text-muted-foreground">
              Free tier accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferred}</div>
            <p className="text-xs text-muted-foreground">
              Users referred by resellers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reseller Management</CardTitle>
          <CardDescription>
            View and manage all resellers. Upgrade to premium, view referred users, and manage custom domains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resellers by name, email, or referral code..."
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-8"
              />
            </div>
            <Select 
              value={filters.type || "all"} 
              onValueChange={(value: string) => setFilters(prev => ({ 
                ...prev, 
                type: value === "all" ? undefined : value as 'FREE' | 'PREMIUM',
                page: 1 
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.limit?.toString()} 
              onValueChange={(value: string) => setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
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
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/15 border border-destructive text-destructive rounded-md">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Resellers Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reseller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Referred Users</TableHead>
                      <TableHead>Landing Page</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resellers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No resellers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      resellers.map((reseller) => (
                        <TableRow key={reseller.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{reseller.user?.name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{reseller.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={reseller.type === 'PREMIUM' ? "default" : "secondary"}>
                              {reseller.type === 'PREMIUM' && <Crown className="w-3 h-3 mr-1" />}
                              {reseller.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {reseller.referral_code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{reseller.total_referred}</div>
                              <div className="text-xs text-muted-foreground">users</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {reseller.landing_slug ? (
                              <div className="flex items-center space-x-1">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/${reseller.landing_slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    /{reseller.landing_slug}
                                  </a>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No landing page</span>
                            )}
                            {reseller.custom_domain && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Custom: {reseller.custom_domain}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(reseller.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Users className="mr-2 h-4 w-4" />
                                  View Referred Users
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Settings
                                </DropdownMenuItem>
                                {reseller.type === 'FREE' && (
                                  <DropdownMenuItem>
                                    <Crown className="mr-2 h-4 w-4" />
                                    Upgrade to Premium
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteReseller(reseller.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Reseller
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} resellers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: meta.page - 1 }))}
                      disabled={meta.page <= 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {meta.page} of {meta.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: meta.page + 1 }))}
                      disabled={meta.page >= meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
