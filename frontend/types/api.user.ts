export interface User {
  id: string;
  clerk_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  image_url: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  clerk_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  imageUrl?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}
