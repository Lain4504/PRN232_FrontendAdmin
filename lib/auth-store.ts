
"use client";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const USER_KEY = "admin_user";

export interface User {
    id: string;
    email: string;
    role: string | number;
    fullName?: string;
}

export const authStore = {
    setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    getAccessToken: () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setUser: (user: User) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser: (): User | null => {
        if (typeof window === "undefined") return null;
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    clearAuth: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    isAuthenticated: () => {
        if (typeof window === "undefined") return false;
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    }
};
