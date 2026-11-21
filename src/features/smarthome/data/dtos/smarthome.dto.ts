/**
 * Response shapes for the smarthome feature.
 *
 * FastAPI (`:8000`)  GET /iot/monitordevicegroup → `{ bucket, device_count, data: [{ group_id, group_name, devices[] }] }`
 * Legacy PHP API GET /mqtt3/monitordevicegroup → `{ statusCode, payload: [{ group_name, data[] }] }`
 * The mapper accepts both.
 */
export interface SmartDeviceDto {
  device_id: number;
  device_name: string;
  hardware_id: number;
  type_id?: number;
  type_name?: string;
  unit?: string;
  measurement?: string;
  value_data?: string;
  devicedata?: string;
  alarm_title?: string;
  alarm_status?: number;
  mqtt_data_control?: string;
  /** legacy API name of mqtt_data_control */
  topicControl?: string;
  mqtt_control_on?: string;
  mqtt_control_off?: string;
  icon?: string;
  timestamp?: string;
  /** legacy API name of timestamp */
  datatime?: string;
  color_normal?: string;
  color_warning?: string;
  color_alert?: string;
}

export interface DeviceGroupDto {
  group_id?: number;
  group_name: string;
  count?: number;
  devices?: SmartDeviceDto[];
  /** legacy API */
  data?: SmartDeviceDto[];
}

export interface DeviceGroupResponseDto {
  bucket?: string;
  timestamp?: string;
  device_count?: number;
  data?: DeviceGroupDto[];
  /** legacy API */
  statusCode?: number;
  payload?: DeviceGroupDto[];
}

/** PHP `settings/dashboardconfig` payload. */
export interface DashboardConfigDto {
  id?: number;
  name: string;
  location_id: number;
  config: {
    updated_at: string;
    door_status: 'opened' | 'closed';
    global_settings: { card_opacity: number; screen_brightness: number };
    groups: {
      group_id: string;
      card_pos: { top: string; left: string };
      target_pos: { top: string; left: string };
    }[];
  };
}
