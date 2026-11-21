'use client';

import { IconDoorEnter, IconDoorExit } from '@tabler/icons-react';

import type { DashboardLayoutConfig } from '../../domain/entities/smarthome.entity';
import styles from '../styles/smarthome.module.scss';
import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

interface Props {
  layout: DashboardLayoutConfig;
  onChange: (p: Partial<DashboardLayoutConfig>) => void;
}

/** PHP "SETTINGS Card Position" block + Access Control door switch (bg image swap). */
export function DisplaySettings({ layout, onChange }: Props) {
  const { t } = useI18n();
  const L = (k: string, f: string, p?: Record<string, string | number>) =>
    tf(t, `smarthome.${k}`, f, p);
  const Door = layout.doorOpened ? IconDoorExit : IconDoorEnter;
  return (
    <div>
      <div className={styles.sectionTitle}>{L('settings', 'Settings')}</div>

      <div className={`${styles.statusItem} mb-2`}>
        <span
          className="d-flex align-items-center gap-2"
          style={{ fontSize: '0.85rem' }}
        >
          <Door
            size={18}
            color={layout.doorOpened ? '#00e5ff' : '#fff'}
            aria-hidden
          />{' '}
          {L('mainDoor', 'Main Door')}
        </span>
        <label className="form-check form-switch m-0">
          <input
            type="checkbox"
            className="form-check-input"
            checked={layout.doorOpened}
            onChange={(e) => onChange({ doorOpened: e.target.checked })}
            aria-label={L('mainDoor', 'Main Door')}
          />
        </label>
      </div>

      <label
        className="d-flex justify-content-between small mb-1"
        htmlFor="sh-opacity"
      >
        <span>{L('cardOpacity', 'Card Opacity')}</span>
        <span>{layout.cardOpacity}%</span>
      </label>
      <input
        id="sh-opacity"
        type="range"
        className="form-range mb-2"
        min={10}
        max={100}
        value={layout.cardOpacity}
        onChange={(e) => onChange({ cardOpacity: Number(e.target.value) })}
      />

      <label
        className="d-flex justify-content-between small mb-1"
        htmlFor="sh-brightness"
      >
        <span>{L('screenBrightness', 'Screen Brightness')}</span>
        <span>{layout.screenBrightness}%</span>
      </label>
      <input
        id="sh-brightness"
        type="range"
        className="form-range"
        min={20}
        max={350}
        value={layout.screenBrightness}
        onChange={(e) => onChange({ screenBrightness: Number(e.target.value) })}
      />
    </div>
  );
}
