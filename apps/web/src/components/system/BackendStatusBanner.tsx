import { useEffect, useState } from 'react';
import { IconAlertTriangle, IconArrowsClockwise, IconCheckCircle } from '../icons/Icons';
import { useBackendHealth } from '../../hooks/system/useBackendHealth';
import './BackendStatusBanner.css';

const useOnlineStatus = () => {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return online;
};

export default function BackendStatusBanner() {
  const isOnline = useOnlineStatus();
  const { data, isFetching, isError, refetch } = useBackendHealth();

  if (isOnline && !isError && data?.status === 'UP') {
    return null;
  }

  return (
    <div className="backend-status-banner" role="status" aria-live="polite">
      <div className="backend-status-banner__content">
        {!isOnline ? (
          <>
            <IconAlertTriangle size={16} />
            <span>Bạn đang offline. Kiểm tra mạng để tiếp tục sử dụng EduCycle.</span>
          </>
        ) : isError ? (
          <>
            <IconAlertTriangle size={16} />
            <span>Backend chưa sẵn sàng. Đang giữ trạng thái an toàn, bạn có thể thử lại.</span>
          </>
        ) : (
          <>
            <IconCheckCircle size={16} />
            <span>Backend đã kết nối lại thành công.</span>
          </>
        )}
      </div>
      <button
        type="button"
        className="backend-status-banner__retry"
        onClick={() => void refetch()}
        disabled={isFetching}
      >
        <IconArrowsClockwise size={14} />
        {isFetching ? 'Đang thử lại...' : 'Thử lại'}
      </button>
    </div>
  );
}

