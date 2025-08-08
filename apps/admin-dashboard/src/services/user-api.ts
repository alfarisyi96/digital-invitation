import { BaseApiService } from './base-api';
import { BackendUser } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  phone?: string;
}

export class UserApiService extends BaseApiService<BackendUser, CreateUserData, UpdateUserData> {
  protected endpoint = '/users';

  constructor() {
    super(apiClient);
  }
}

export const userApiService = new UserApiService();
