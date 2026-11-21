'use client';

import { useToast } from '@/app/_components/shared/toast-provider';
import SmarthomeDashboardPage, {
  type SmarthomeMode,
} from '@/src/features/smarthome/presentation/pages/smarthome-dashboard';

/** Route-side wrapper: wires the app toast into the smarthome feature page. */
export function SmarthomeClient({ mode }: { mode: SmarthomeMode }) {
  const { showToast } = useToast();
  return <SmarthomeDashboardPage mode={mode} notify={showToast} />;
}
