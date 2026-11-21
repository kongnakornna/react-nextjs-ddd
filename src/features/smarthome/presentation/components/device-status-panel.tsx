'use client';

import { useState } from 'react';
import { IconCloudOff } from '@tabler/icons-react';

import type {
  DeviceGroup,
  SmartDevice,
} from '../../domain/entities/smarthome.entity';
import { isControllable, isOn } from '../../domain/entities/smarthome.entity';
import { isBlinking, levelColor } from '../../domain/services/alarm-level';
import styles from '../styles/smarthome.module.scss';
import { DeviceIcon } from './device-icon';
import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

interface Props {
  groups: DeviceGroup[];
  onToggle: (device: SmartDevice, turnOn: boolean) => Promise<void>;
}

const statusTone = (d: SmartDevice) =>
  d.alarmLevel === 'alarm'
    ? styles['status-alarm']
    : d.alarmLevel === 'warning'
      ? styles['status-warning']
      : '';

/** PHP `#device-status-container` (updateMenuDisplay) with ON/OFF switches for IO Control devices. */
export function DeviceStatusPanel({ groups, onToggle }: Props) {
  const { t } = useI18n();
  const L = (k: string, f: string, p?: Record<string, string | number>) =>
    tf(t, `smarthome.${k}`, f, p);
  const [pending, setPending] = useState<Record<number, boolean>>({});

  if (groups.length === 0) {
    return (
      <div className="text-center text-secondary py-3">
        <IconCloudOff size={32} aria-hidden />
        <p className="mt-2 mb-0">
          {L('noDeviceData', 'No device data available')}
        </p>
      </div>
    );
  }

  const handle = async (d: SmartDevice, on: boolean) => {
    setPending((p) => ({ ...p, [d.id]: true }));
    try {
      await onToggle(d, on);
    } finally {
      setPending((p) => ({ ...p, [d.id]: false }));
    }
  };

  return (
    <>
      {groups.map((g) => (
        <div key={g.key} className="mb-3">
          <div className={styles.sectionTitle}>{g.name}</div>
          {g.devices.map((d) => {
            const color = levelColor(d.alarmLevel, d.colors);
            const blink = isBlinking(d.alarmLevel) ? styles.blink : '';
            return (
              <div
                key={d.id}
                className={`${styles.statusItem} ${statusTone(d)}`}
              >
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                  <DeviceIcon
                    name={d.name}
                    size={18}
                    className={`me-2 flex-shrink-0 ${blink}`}
                  />
                  <div className="overflow-hidden">
                    <div
                      className="text-truncate"
                      style={{ fontSize: '0.85rem', fontWeight: 500 }}
                    >
                      {d.name}{' '}
                      {d.alarmTitle && (
                        <small className={`fw-bold ${blink}`} style={{ color }}>
                          {d.alarmTitle}
                        </small>
                      )}
                    </div>
                    <div className={`fw-bold ${blink}`} style={{ color }}>
                      {d.display}{' '}
                      {d.timestamp && (
                        <small className={styles.muted}>{d.timestamp}</small>
                      )}
                    </div>
                  </div>
                </div>
                {isControllable(d) && (
                  <label
                    className="form-check form-switch m-0"
                    title={`${d.name} ON/OFF`}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isOn(d)}
                      disabled={pending[d.id]}
                      onChange={(e) => void handle(d, e.target.checked)}
                      aria-label={`${d.name} switch`}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
