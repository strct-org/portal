"use client";

import { apiService } from "@/api";
import { Device } from "@/types/api.device";
import { User } from "@/types/api.user";
import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface PortalContextType {
  user: User | null;
  devices: Device[];

  refreshUser: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  refreshAll: () => Promise<void>;

  addDeviceToState: (device: Device) => void;
  updateDeviceInState: (device: Device) => void;
  removeDeviceFromState: (deviceId: string) => void;

  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

interface PortalProviderProps {
  children: ReactNode;
}

export function PortalProvider({ children }: PortalProviderProps) {
  const { getToken, isSignedIn } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const hasInitialized = useRef(false);

  const withLoadingAndError = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void,
      skipGlobalLoading: boolean = false
    ): Promise<T | null> => {
      try {
        if (!skipGlobalLoading) setIsLoading(true);
        setError(null);

        const result = await apiCall();

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("API Error:", err);
        return null;
      } finally {
        if (!skipGlobalLoading) setIsLoading(false);
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    if (!isSignedIn) return;
    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getUser(token);
      },
      (data) => setUser(data)
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshDevices = useCallback(async () => {
    if (!isSignedIn) return;
    await withLoadingAndError(
      async () => {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return await apiService.getDevices(token);
      },
      (data) => setDevices(data),
      true // Skip global loading spinner for device refreshes
    );
  }, [isSignedIn, getToken, withLoadingAndError]);

  const refreshAll = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const [userResult, devicesResult] = await Promise.allSettled([
        apiService.getUser(token),
        apiService.getDevices(token),
      ]);

      if (userResult.status === "fulfilled") {
        setUser(userResult.value);
      } else {
        console.error("Failed to fetch user:", userResult.reason);
        setError("Failed to load user profile");
      }

      if (devicesResult.status === "fulfilled") {
        console.log(devicesResult.value)
        setDevices(devicesResult.value);
      } else {
        console.error("Failed to fetch devices:", devicesResult.reason);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  const addDeviceToState = (newDevice: Device) => {
    setDevices((prev) => [...(prev || []), newDevice]);
  };
  
  const updateDeviceInState = (updatedDevice: Device) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
    );
  };

  const removeDeviceFromState = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  useEffect(() => {
    const initApp = async () => {
      if (isSignedIn && !hasInitialized.current) {
        hasInitialized.current = true;
        refreshAll();
      }
      if (!isSignedIn) {
        hasInitialized.current = false;
        setUser(null);
        setDevices([]);
      }
    };
    initApp();
  }, [isSignedIn, refreshAll]);

  const value: PortalContextType = {
    user,
    devices,
    refreshUser,
    refreshDevices,
    refreshAll,
    addDeviceToState,
    updateDeviceInState,
    removeDeviceFromState,
    isLoading,
    isInitialLoading,
    error,
  };

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error("usePortal must be used within an PortalProvider");
  }
  return context;
}
