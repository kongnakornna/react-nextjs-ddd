'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  DashboardLayoutConfig,
  GroupPosition,
  Point,
} from '../../domain/entities/smarthome.entity';
import { defaultLayout } from '../../domain/services/alarm-level';
import { smarthome } from '../smarthome.container';

export type DragPart = 'card' | 'target';

/** Dashboard layout (card positions, opacity, brightness, door) — PHP loadConfig/applyConfig/updateJSON. */
export function useDashboardLayout(locationId: number, name: string) {
  const [layout, setLayout] = useState<DashboardLayoutConfig>(() =>
    defaultLayout(locationId, name)
  );
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    smarthome.getLayout
      .execute(locationId, name)
      .then((l) => !cancelled && setLayout(l))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [locationId, name]);

  const patch = useCallback((p: Partial<DashboardLayoutConfig>) => {
    setLayout((l) => ({ ...l, ...p }));
    setDirty(true);
  }, []);

  /** Move a card or its target point; `current` is the resolved position (may be a default). */
  const move = useCallback(
    (current: GroupPosition, part: DragPart, point: Point) => {
      setLayout((l) => {
        const next: GroupPosition = { ...current, [part]: point };
        const others = l.groups.filter((g) => g.groupKey !== current.groupKey);
        return { ...l, groups: [...others, next] };
      });
      setDirty(true);
    },
    []
  );

  /** `override` is merged into the current layout before saving. */
  const save = useCallback(
    async (override?: Partial<DashboardLayoutConfig>) => {
      setSaving(true);
      try {
        const saved = await smarthome.saveLayout.execute({
          ...layout,
          ...override,
        });
        setLayout(saved);
        setDirty(false);
        return saved;
      } finally {
        setSaving(false);
      }
    },
    [layout]
  );

  const reset = useCallback(() => {
    setLayout(defaultLayout(locationId, name));
    setDirty(true);
  }, [locationId, name]);

  return { layout, loaded, saving, dirty, patch, move, save, reset };
}
