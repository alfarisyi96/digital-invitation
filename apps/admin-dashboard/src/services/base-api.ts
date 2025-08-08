import { ApiResponse } from '@/types';

export interface BaseEntity {
  id: string;
  created_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Simple HTTP client interface that matches our existing API client
interface HttpClient {
  get: (url: string) => Promise<any>;
  post: (url: string, data: any) => Promise<any>;
  put: (url: string, data: any) => Promise<any>;
  delete: (url: string) => Promise<any>;
}

export abstract class BaseApiService<T extends BaseEntity, CreateData = Partial<T>, UpdateData = Partial<T>> {
  protected abstract endpoint: string;
  
  constructor(protected httpClient: HttpClient) {}

  async getAll(params: PaginationParams): Promise<ApiResponse<T[]> & { meta?: PaginationMeta }> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
    });

    return await this.httpClient.get(`${this.endpoint}?${queryParams}`);
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    return await this.httpClient.get(`${this.endpoint}/${id}`);
  }

  async create(data: CreateData): Promise<ApiResponse<T>> {
    return await this.httpClient.post(this.endpoint, data);
  }

  async update(id: string, data: UpdateData): Promise<ApiResponse<T>> {
    return await this.httpClient.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return await this.httpClient.delete(`${this.endpoint}/${id}`);
  }

  async getStats?(): Promise<ApiResponse<any>> {
    return await this.httpClient.get(`${this.endpoint}/stats`);
  }
}
