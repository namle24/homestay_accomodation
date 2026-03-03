import api from "./api";
import {
  LoginRequest,
  UserCreate,
  TokenResponse,
  UserResponse,
} from "../types/auth";

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/auth/register", data);
    return response.data;
  },
};
