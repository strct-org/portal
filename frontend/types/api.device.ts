export interface Device {
  id: string;
  owner_id: string;
  friendly_name: string;
  is_online: boolean;
  local_ip: string;
  version: string;
  last_seen: string; 
  created_at: string;
  updated_at: string;
}

export interface FileMetadata {
  id: number;
  device_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_starred: boolean;
  created_at: string;
}

export interface DeviceParams {
  updated_at: string;
  last_seen: string;
  local_ip: string;
  version: string;
  is_online: boolean;
}
