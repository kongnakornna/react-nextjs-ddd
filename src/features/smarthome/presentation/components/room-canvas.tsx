'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import type {
  DeviceGroup,
  GroupPosition,
  Point,
} from '../../domain/entities/smarthome.entity';
import {
  isBlinking,
  leaderPath,
  levelColor,
} from '../../domain/services/alarm-level';
import type { DragPart } from '../hooks/use-dashboard-layout';
import styles from '../styles/smarthome.module.scss';
import { DeviceIcon } from './device-icon';
import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

const MAX_DEVICES_PER_CARD = 30; // PHP: if ($device_count >= 30) break;
const TARGET_RADIUS = 6;

interface Props {
  groups: DeviceGroup[];
  positions: Record<string, GroupPosition>;
  background: string;
  cardOpacity: number;
  brightness: number;
  editable?: boolean;
  onMove?: (current: GroupPosition, part: DragPart, point: Point) => void;
}

interface DragState {
  groupKey: string;
  part: DragPart;
  startX: number;
  startY: number;
  origin: Point;
}

const tone = (level: DeviceGroup['level']) =>
  level === 'alarm' ? 'alarm' : level === 'warning' ? 'warning' : 'normal';

/**
 * Room image + HUD cards + leader lines (PHP `#visual-canvas`, `.hud-overlay`,
 * `.target-point`, `#svg-layer`). In `editable` mode cards and points can be
 * dragged with the pointer (replaces jQuery UI draggable).
 */
export function RoomCanvas({
  groups,
  positions,
  background,
  cardOpacity,
  brightness,
  editable,
  onMove,
}: Props) {
  const { t } = useI18n();
  const L = (k: string, f: string, p?: Record<string, string | number>) =>
    tf(t, `smarthome.${k}`, f, p);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>(
    {}
  );
  const [drag, setDrag] = useState<DragState | null>(null);
  const [live, setLive] = useState<Record<string, GroupPosition>>({});

  // Measure cards after every render that may change their size.
  useLayoutEffect(() => {
    const next: Record<string, { w: number; h: number }> = {};
    for (const g of groups) {
      const el = cardRefs.current[g.key];
      if (el) next[g.key] = { w: el.offsetWidth, h: el.offsetHeight };
    }
    setSizes((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
  }, [groups, positions, live]);

  const posOf = useCallback(
    (key: string) => live[key] ?? positions[key],
    [live, positions]
  );

  const onPointerDown = (
    e: ReactPointerEvent,
    groupKey: string,
    part: DragPart
  ) => {
    if (!editable) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = posOf(groupKey);
    setDrag({
      groupKey,
      part,
      startX: e.clientX,
      startY: e.clientY,
      origin: p[part],
    });
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag) return;
    const point = {
      top: Math.max(0, drag.origin.top + e.clientY - drag.startY),
      left: Math.max(0, drag.origin.left + e.clientX - drag.startX),
    };
    const current = posOf(drag.groupKey);
    setLive((l) => ({
      ...l,
      [drag.groupKey]: { ...current, [drag.part]: point },
    }));
  };

  const onPointerUp = () => {
    if (!drag) return;
    const moved = live[drag.groupKey];
    if (moved && onMove)
      onMove(positions[drag.groupKey], drag.part, moved[drag.part]);
    setDrag(null);
    setLive({});
  };

  return (
    <div
      className={styles.stage}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={background}
        alt="Room layout"
        className={styles.roomImg}
        style={{ filter: `brightness(${brightness / 100})` }}
        draggable={false}
      />

      <svg className={styles.svgLayer} aria-hidden>
        {groups.map((g) => {
          const p = posOf(g.key);
          const s = sizes[g.key];
          if (!p || !s) return null;
          const d = leaderPath(
            { x: p.card.left + s.w / 2, y: p.card.top + s.h / 2 },
            {
              x: p.target.left + TARGET_RADIUS,
              y: p.target.top + TARGET_RADIUS,
            }
          );
          return (
            <path
              key={g.key}
              d={d}
              className={`${styles.line} ${styles[`line-${tone(g.level)}`]}`}
            />
          );
        })}
      </svg>

      {groups.map((g) => {
        const p = posOf(g.key);
        if (!p) return null;
        const t = tone(g.level);
        return (
          <div key={g.key}>
            <div
              ref={(el) => {
                cardRefs.current[g.key] = el;
              }}
              id={g.key}
              className={`${styles.hud} ${t !== 'normal' ? styles[`hud-${t}`] : ''} ${editable ? styles.editable : ''}`}
              style={{
                top: p.card.top,
                left: p.card.left,
                background: `rgba(0,0,0,${cardOpacity / 100})`,
              }}
              onPointerDown={(e) => onPointerDown(e, g.key, 'card')}
            >
              <div className={styles.groupHeader}>
                {t !== 'normal' && (
                  <span
                    className={styles.blink}
                    style={{ color: levelColor(g.level) }}
                  >
                    ●
                  </span>
                )}
                {g.name}
              </div>
              {g.devices.length === 0 && (
                <div className={styles.muted}>{L('noDevice', 'No device')}</div>
              )}
              {g.devices.slice(0, MAX_DEVICES_PER_CARD).map((d) => {
                const color = levelColor(d.alarmLevel, d.colors);
                const blink = isBlinking(d.alarmLevel) ? styles.blink : '';
                return (
                  <div key={d.id} className={styles.deviceRow}>
                    <DeviceIcon
                      name={d.name}
                      size={14}
                      className={`me-1 ${blink}`}
                    />
                    {d.name} : <strong>{d.display}</strong>
                    {d.alarmTitle && (
                      <>
                        {' '}
                        :{' '}
                        <small className={`fw-bold ${blink}`} style={{ color }}>
                          {d.alarmTitle}
                        </small>
                      </>
                    )}
                    {d.timestamp && (
                      <div className={styles.muted}>{d.timestamp}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={`${styles.target} ${t !== 'normal' ? styles[`target-${t}`] : ''} ${editable ? styles.editable : ''}`}
              style={{ top: p.target.top, left: p.target.left }}
              onPointerDown={(e) => onPointerDown(e, g.key, 'target')}
              title={
                editable
                  ? `${g.name} — ${L('dragPoint', 'drag point')}`
                  : g.name
              }
            />
          </div>
        );
      })}
    </div>
  );
}
