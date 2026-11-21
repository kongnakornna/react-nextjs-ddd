'use client';

import { useMemo } from 'react';
import {
  IconArrowBackUp,
  IconCopy,
  IconDeviceFloppy,
  IconRefresh,
} from '@tabler/icons-react';

import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';
import type { SmartDevice } from '../../domain/entities/smarthome.entity';
import { resolvePositions } from '../../domain/services/alarm-level';
import { toConfigDto } from '../../data/mappers/smarthome.mapper';
import { DeviceStatusPanel } from '../components/device-status-panel';
import { DisplaySettings } from '../components/display-settings';
import { RoomCanvas } from '../components/room-canvas';
import { SmarthomeMenu } from '../components/smarthome-menu';
import { useDashboardLayout } from '../hooks/use-dashboard-layout';
import { useDeviceGroups } from '../hooks/use-device-groups';
import { SMARTHOME_LOCATION } from '../smarthome.config';
import styles from '../styles/smarthome.module.scss';

export type SmarthomeMode = 'view' | 'setting';
export type Notify = (
  message: string,
  type?: 'success' | 'error' | 'info' | 'warning'
) => void;

/**
 * Smarthome dashboard.
 *  - `view`    → PHP `smarthome/index`            (dashboardsetting/dashboardcontainer.php)
 *  - `setting` → PHP `smarthome/dashboardsetting` (drag cards/points, JSON preview, save)
 */
export default function SmarthomeDashboardPage({
  mode = 'view',
  notify = () => undefined,
}: {
  mode?: SmarthomeMode;
  /** Toast callback — injected by the route (features may not import app/). */
  notify?: Notify;
}) {
  const loc = SMARTHOME_LOCATION;
  const { lang, t } = useI18n();
  const L = (k: string, f: string, p?: Record<string, string | number>) =>
    tf(t, `smarthome.${k}`, f, p);
  const editing = mode === 'setting';

  const { snapshot, error, loading, lastUpdate, reload, toggle } =
    useDeviceGroups({
      bucket: loc.bucket,
      locationId: loc.locationId,
      lang,
      refreshMs: loc.refreshMs,
    });
  const { layout, saving, dirty, patch, move, save, reset } =
    useDashboardLayout(loc.locationId, loc.name);

  const groups = useMemo(() => snapshot?.groups ?? [], [snapshot]);
  const positions = useMemo(
    () => resolvePositions(groups, layout.groups),
    [groups, layout.groups]
  );
  const json = useMemo(
    () =>
      editing
        ? JSON.stringify(
            toConfigDto({ ...layout, groups: Object.values(positions) }),
            null,
            2
          )
        : '',
    [editing, layout, positions]
  );

  const onToggle = async (d: SmartDevice, on: boolean) => {
    try {
      await toggle(d, on);
      notify(
        on
          ? L('turnedOn', `${d.name} turned ON`, { name: d.name })
          : L('turnedOff', `${d.name} turned OFF`, { name: d.name }),
        'success'
      );
    } catch {
      notify(
        L('controlFailed', `Failed to control ${d.name}`, { name: d.name }),
        'error'
      );
    }
  };

  const onSave = async () => {
    try {
      // persist every visible group, including ones still on default positions
      await save({ groups: Object.values(positions) });
      notify(L('saved', 'Saved'), 'success');
    } catch {
      notify(L('saveFailed', 'Save failed'), 'error');
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      notify(L('jsonCopied', 'JSON copied'), 'info');
    } catch {
      notify(L('copyFailed', 'Copy failed'), 'error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.visual}>
        {loading && !snapshot && (
          <div className={styles.overlay}>
            <div className="spinner-border" role="status" />
            <div>{L('loading', 'Loading Dashboard...')}</div>
          </div>
        )}
        <RoomCanvas
          groups={groups}
          positions={positions}
          background={layout.doorOpened ? loc.bgOpened : loc.bgClosed}
          cardOpacity={layout.cardOpacity}
          brightness={layout.screenBrightness}
          editable={editing}
          onMove={move}
        />
      </div>

      <aside className={styles.panel}>
        <SmarthomeMenu />

        <div className="d-flex align-items-center justify-content-between">
          <span className={styles.muted}>
            {loc.name} · {snapshot?.deviceCount ?? 0} {L('devices', 'devices')}
            {lastUpdate && ` · ${lastUpdate.toLocaleTimeString()}`}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-ghost-info"
            onClick={() => void reload()}
            aria-label={L('refresh', 'Refresh')}
          >
            <IconRefresh size={16} />
          </button>
        </div>

        <div className={styles.scrollArea}>
          {error ? (
            <ApiErrorView error={error} />
          ) : (
            <DeviceStatusPanel groups={groups} onToggle={onToggle} />
          )}
        </div>

        <DisplaySettings layout={layout} onChange={patch} />

        {editing && (
          <div>
            <div className="d-flex justify-content-between align-items-center">
              <div className={styles.sectionTitle}>
                {L('jsonPreview', 'JSON Preview')}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={copyJson}
                aria-label={L('jsonPreview', 'JSON Preview')}
              >
                <IconCopy size={14} />
              </button>
            </div>
            <textarea
              className={styles.jsonPreview}
              rows={6}
              readOnly
              value={json}
            />
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-fill"
                onClick={reset}
              >
                <IconArrowBackUp size={16} className="me-1" />{' '}
                {L('reset', 'Reset')}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary flex-fill"
                onClick={onSave}
                disabled={saving || !dirty}
              >
                <IconDeviceFloppy size={16} className="me-1" />{' '}
                {saving ? L('saving', 'Saving...') : L('save', 'Save')}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
