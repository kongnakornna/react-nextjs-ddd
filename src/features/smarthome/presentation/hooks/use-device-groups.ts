'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  DeviceGroupSnapshot,
  SmartDevice,
} from '../../domain/entities/smarthome.entity';
import { smarthome } from '../smarthome.container';

interface Options {
  bucket: string;
  locationId: number;
  lang: string;
  refreshMs: number;
}

/**
 * Device groups with polling (PHP DashboardApp.updateDeviceData + startPeriodicUpdates).
 * Polling pauses while the tab is hidden.
 */
export function useDeviceGroups({
  bucket,
  locationId,
  lang,
  refreshMs,
}: Options) {
  const [snapshot, setSnapshot] = useState<DeviceGroupSnapshot | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const callId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    try {
      const s = await smarthome.getDeviceGroups.execute({
        bucket,
        locationId,
        lang,
      });
      if (id !== callId.current) return;
      setSnapshot(s);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      if (id === callId.current) setError(err);
    } finally {
      if (id === callId.current) setLoading(false);
    }
  }, [bucket, locationId, lang]);

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void reload();
    }, refreshMs);
    return () => window.clearInterval(timer);
  }, [reload, refreshMs]);

  const toggle = useCallback(
    async (device: SmartDevice, turnOn: boolean) => {
      await smarthome.toggleDevice.execute(device, turnOn);
      // PHP waited 1s for the device to report back before refreshing.
      window.setTimeout(() => void reload(), 1000);
    },
    [reload]
  );

  return { snapshot, error, loading, lastUpdate, reload, toggle };
}
