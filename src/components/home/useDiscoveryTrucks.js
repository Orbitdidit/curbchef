import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const visible = { is_approved: true, $or: [{ is_sample: true }, { status: 'open' }] };
// Food photos sell. Trucks with a real photo lead; trucks with no photo
// (they'd fall back to a generic truck shot) go to the back of every rail.
const hasPhoto = t => Boolean(t.image_url || t.cover_image_url);
const foodFirst = items => [...items].sort((a, b) => Number(hasPhoto(b)) - Number(hasPhoto(a)));

const getTrucks = async query => {
  const page = await base44.entities.FoodTruck.filter(query, { sort: '-rating', limit: 50 });
  return foodFirst(page.items || []);
};

export default function useDiscoveryTrucks(category) {
  const all = useQuery({ queryKey: ['discovery-trucks'], queryFn: () => getTrucks(visible), refetchInterval: 60000 });
  const cuisine = useQuery({
    queryKey: ['discovery-cuisine', category],
    queryFn: () => getTrucks({ ...visible, cuisine_type: category }),
    enabled: category !== 'all', refetchInterval: 60000,
  });
  const live = useQuery({
    queryKey: ['discovery-live', category],
    queryFn: () => getTrucks({ ...visible, is_live: true, ...(category === 'all' ? {} : { cuisine_type: category }) }),
    refetchInterval: 60000,
  });
  const selected = category === 'all' ? all : cuisine;
  return {
    trucks: all.data || [], filteredTrucks: selected.data || [], liveTrucks: live.data || [],
    isLoading: all.isLoading || selected.isLoading,
    isError: all.isError || selected.isError,
    refetch: () => { all.refetch(); if (category !== 'all') cuisine.refetch(); live.refetch(); },
  };
}