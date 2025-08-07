import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/admin`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with requests
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear any client-side user data and redirect to login
          this.clearUserData();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_user');
    }
  }

  public setUserData(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_user', JSON.stringify(user));
    }
  }

  public getUserData(): any {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('admin_user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  // Dashboard API methods
  public async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  // User API methods
  public async getUsers(params?: { page?: number; limit?: number; search?: string; reseller_id?: string }) {
    return this.get('/users', params);
  }

  public async getUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  public async getUserStats() {
    return this.get('/users/stats');
  }

  // Reseller API methods
  public async getResellers(params?: { page?: number; limit?: number; type?: string; search?: string }) {
    return this.get('/resellers', params);
  }

  public async createReseller(data: { user_id: string; type: string; landing_slug?: string; custom_domain?: string }) {
    return this.post('/resellers', data);
  }

  public async getResellerById(id: string) {
    return this.get(`/resellers/${id}`);
  }

  public async updateReseller(id: string, data: { type?: string; landing_slug?: string; custom_domain?: string }) {
    return this.put(`/resellers/${id}`, data);
  }

  public async deleteReseller(id: string) {
    return this.delete(`/resellers/${id}`);
  }

  public async getResellerByReferralCode(code: string) {
    return this.get(`/resellers/referral/${code}`);
  }

  // Invite API methods
  public async getInvites(params?: { 
    page?: number; 
    limit?: number; 
    user_id?: string; 
    plan_id?: string; 
    template_id?: string; 
    type?: string; 
    is_published?: string;
  }) {
    return this.get('/invites', params);
  }

  public async getInviteById(id: string) {
    return this.get(`/invites/${id}`);
  }

  public async getInviteBySlug(slug: string) {
    return this.get(`/invites/slug/${slug}`);
  }

  public async deleteInvite(id: string) {
    return this.delete(`/invites/${id}`);
  }

  public async getInviteStats() {
    return this.get('/invites/stats');
  }

  // Auth API methods
  public async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  public async logout() {
    return this.post('/auth/logout');
  }

  public async getProfile() {
    return this.get('/auth/profile');
  }

  public async createAdmin(data: { name: string; email: string; password: string }) {
    return this.post('/auth/create-admin', data);
  }
}

export const apiClient = new ApiClient();
