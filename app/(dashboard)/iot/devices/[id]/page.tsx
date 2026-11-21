import DeviceDetailPage from '@/src/features/iot/presentation/pages/device-detail';

export default function DeviceDetailRoutePage({ params }: { params: { id: string } }) {
  return <DeviceDetailPage deviceId={params.id} />;
}
