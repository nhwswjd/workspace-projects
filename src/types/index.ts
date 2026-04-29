export interface Video {
  id: string;
  url: string;
  poster: string;
  duration?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  coverImage: string;
  images: string[];
  videos: Video[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}
