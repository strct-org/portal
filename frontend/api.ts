import { Device } from "./types/api.device";
import { User } from "./types/api.user";

class ApiService {
  private baseUrl: string;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.warn("NEXT_PUBLIC_API_URL not set, using localhost");
    }

    this.baseUrl = apiUrl || "http://localhost:3000";
    console.log("API initialized with base URL:", this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { token?: string }
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (error) {
        console.log(error);
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }

      console.log(
        `Error response: ${errorText} | failed endpoint: ${endpoint}`
      );

      if (response.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }

      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    try {
      const data = await response.json();
      // console.log(`Success response:`, data);
      return data;
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      throw new Error("Invalid JSON response from server");
    }
  }

  async getUser(token: string, retries = 5): Promise<User> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Fetch user attempt ${attempt + 1}/${retries + 1}`);
        console.log(token);
        return await this.makeRequest<User>("/api/v1/user", {
          method: "GET",
          token,
        });
      } catch (err) {
        const isLastAttempt = attempt === retries;

        console.warn(`Attempt ${attempt + 1} failed:`, err);

        if (isLastAttempt) {
          throw err;
        }

        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw new Error("Unexpected fetch failure");
  }

  async createUser(userData: Partial<User>, token: string): Promise<User> {
    return this.makeRequest<User>("/api/v1/user", {
      method: "POST",
      token,
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(token: string): Promise<void> {
    return this.makeRequest<void>("/api/v1/user", {
      method: "DELETE",
      token,
    });
  }

  //TODO
  // async updateUserProfile(
  //   updateReq: UpdateUserProfileReq,
  //   token: string
  // ): Promise<User> {
  //   return this.makeRequest<UserDUserata>("/api/v1/user/update-profile", {
  //     method: "PUT",
  //     token,
  //     body: JSON.stringify(updateReq),
  //   });
  // }

  async getDevices(token: string): Promise<Device[]> {
    return this.makeRequest<Device[]>("/api/v1/device", {
      method: "GET",
      token,
    });
  }

  async claimDevice(
    args: {
      serial_number: string;
      claim_token: string;
      friendly_name: string;
    },
    token: string
  ): Promise<Device> {
    return this.makeRequest<Device>("/api/v1/device/claim", {
      method: "POST",
      token,
      body: JSON.stringify(args),
    });
  }
}

export const apiService = new ApiService();
