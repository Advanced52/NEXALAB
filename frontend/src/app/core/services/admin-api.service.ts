import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Category,
  Division,
  Product,
  ServiceItem,
  Setting,
  AuthUser,
} from '../models/api.models';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  getDivisions() {
    return this.api.get<Division[]>('/admin/divisions');
  }
  createDivision(body: Partial<Division>) {
    return this.api.post<Division>('/admin/divisions', body);
  }
  updateDivision(id: string, body: Partial<Division>) {
    return this.api.patch<Division>(`/admin/divisions/${id}`, body);
  }
  deleteDivision(id: string) {
    return this.api.delete<{ message: string }>(`/admin/divisions/${id}`);
  }

  getCategories(divisionId?: string) {
    const q = divisionId ? `?divisionId=${divisionId}` : '';
    return this.api.get<Category[]>(`/admin/categories${q}`);
  }
  createCategory(body: Partial<Category>) {
    return this.api.post<Category>('/admin/categories', body);
  }
  updateCategory(id: string, body: Partial<Category>) {
    return this.api.patch<Category>(`/admin/categories/${id}`, body);
  }
  deleteCategory(id: string) {
    return this.api.delete<{ message: string }>(`/admin/categories/${id}`);
  }

  getProducts() {
    return this.api.get<Product[]>('/admin/products');
  }
  createProduct(body: unknown) {
    return this.api.post<Product>('/admin/products', body);
  }
  updateProduct(id: string, body: unknown) {
    return this.api.patch<Product>(`/admin/products/${id}`, body);
  }
  deleteProduct(id: string) {
    return this.api.delete<{ message: string }>(`/admin/products/${id}`);
  }

  getServices() {
    return this.api.get<ServiceItem[]>('/admin/services');
  }
  createService(body: unknown) {
    return this.api.post<ServiceItem>('/admin/services', body);
  }
  updateService(id: string, body: unknown) {
    return this.api.patch<ServiceItem>(`/admin/services/${id}`, body);
  }
  deleteService(id: string) {
    return this.api.delete<{ message: string }>(`/admin/services/${id}`);
  }

  getUsers() {
    return this.api.get<AuthUser[]>('/admin/users');
  }
  getSettings() {
    return this.api.get<Setting[]>('/admin/settings');
  }
  upsertSetting(body: {
    key: string;
    value: unknown;
    description?: string;
    isPublic?: boolean;
  }) {
    return this.api.put<Setting>('/admin/settings', body);
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(
      `${environment.apiUrl}/admin/uploads`,
      formData,
    );
  }
}
