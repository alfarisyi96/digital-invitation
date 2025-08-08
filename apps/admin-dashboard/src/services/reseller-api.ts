import { BaseApiService } from './base-api';
import { apiClient } from '@/lib/api-client';

// Define the Reseller entity type
export interface Reseller {
  id: string;
  created_at: string;
  type: 'BASIC' | 'PREMIUM';
  name: string;
  email: string;
  commission_rate: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateResellerData {
  type: 'BASIC' | 'PREMIUM';
  name: string;
  email: string;
  commission_rate: number;
}

export interface UpdateResellerData {
  type?: 'BASIC' | 'PREMIUM';
  name?: string;
  email?: string;
  commission_rate?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export class ResellerApiService extends BaseApiService<Reseller, CreateResellerData, UpdateResellerData> {
  protected endpoint = '/resellers';

  constructor() {
    super(apiClient);
  }
}

export const resellerApiService = new ResellerApiService();
