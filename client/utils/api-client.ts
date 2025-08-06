// API Client with authentication handling
const API_BASE_URL = 'http://127.0.0.1:8000';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error_code?: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    // Handle authentication errors
    if (response.status === 401) {
      // Clear localStorage on authentication failure
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new Error(data.message || 'Authentication required');
    }
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Authentication specific methods
  async checkAuth() {
    return this.get('/accounts/api/check-auth/');
  }

  async login(email: string, password: string, userType: 'student' | 'faculty' | 'principal') {
    return this.post(`/accounts/api/${userType}/login/`, { email, password });
  }

  async logout() {
    return this.post('/accounts/api/logout/');
  }

  // Student specific methods
  async getCurrentStudent() {
    return this.get('/accounts/api/student/current/');
  }

  async getStudentPracticeQuestions() {
    return this.get('/accounts/api/student/practice-questions/');
  }

  async getClasses() {
    return this.get('/accounts/api/classes/');
  }

  async getSubjects() {
    return this.get('/accounts/api/subjects/');
  }

  async studentSignup(data: {
    name: string;
    email: string;
    password: string;
    roll_id: string;
    student_class_id: number;
    subject_ids: number[];
  }) {
    return this.post('/accounts/api/student/signup/', data);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;