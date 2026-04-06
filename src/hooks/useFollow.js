import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFollow(truckId, truckName) {
  const qc = useQueryClient();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserEmail(u?.email)).catch(() => {});
  }, []);

  const queryKey = ['follows', userEmail, truckId];

  const { data: follows = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Follow.filter({ user_email: userEmail, truck_id: truckId }),
    enabled: !!userEmail && !!truckId,
  });

  const isFollowing = follows.length > 0;
  const followId = follows[0]?.id;

  const followMutation = useMutation({
    mutationFn: () => base44.entities.Follow.create({ user_email: userEmail, truck_id: truckId, truck_name: truckName }),
    // Optimistic: immediately show "following"
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, [{ id: 'optimistic', user_email: userEmail, truck_id: truckId }]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(queryKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => base44.entities.Follow.delete(followId),
    // Optimistic: immediately show "not following"
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, []);
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(queryKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const toggle = () => {
    if (!userEmail) return;
    if (isFollowing) unfollowMutation.mutate();
    else followMutation.mutate();
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  return { isFollowing, toggle, isPending };
}