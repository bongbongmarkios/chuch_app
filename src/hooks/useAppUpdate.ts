import { useUpdate } from '@/context/UpdateContext';

export const useAppUpdate = () => {
  const {
    updateInfo,
    updateProgress,
    checkForUpdates,
    downloadAndApplyUpdate,
  } = useUpdate();

  return {
    updateInfo,
    updateProgress,
    checkForUpdates,
    downloadAndApplyUpdate,
  };
};
