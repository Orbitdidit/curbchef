import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Fetches all HomepageConfig records and returns a map keyed by config.key
 * Usage: const cfg = useHomepageConfig(); cfg['hero_video']?.video_url
 */
export function useHomepageConfig() {
  const { data = [] } = useQuery({
    queryKey: ['homepage_config'],
    queryFn: () => base44.entities.HomepageConfig.list(),
    staleTime: 60_000,
  });

  return data.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});
}