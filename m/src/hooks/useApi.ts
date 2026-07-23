import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

type ApiMethod = (...args: any[]) => Promise<AxiosResponse>;

export function useGetAll<T>(key: string[], apiMethod: ApiMethod, params?: Record<string, any>, options?: UseQueryOptions<T>) {
  return useQuery<T>({
    queryKey: [...key, params],
    queryFn: async () => {
      const { data } = await apiMethod(params);
      return data.data ?? data;
    },
    ...options,
  });
}

export function useGetById<T>(key: string[], apiMethod: ApiMethod, id: string | undefined, options?: UseQueryOptions<T>) {
  return useQuery<T>({
    queryKey: [...key, id],
    queryFn: async () => {
      const { data } = await apiMethod(id);
      return data.data ?? data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useGetOne<T>(key: string[], apiMethod: () => Promise<any>, options?: UseQueryOptions<T>) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiMethod();
      return data.data ?? data;
    },
    ...options,
  });
}

export function useCreate<T>(key: string[], apiMethod: ApiMethod, options?: UseMutationOptions<any, Error, T>) {
  const queryClient = useQueryClient();
  return useMutation<any, Error, T>({
    mutationFn: async (payload) => {
      const { data: response } = await apiMethod(payload);
      return response.data ?? response;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); },
    ...options,
  });
}

export function useUpdate<T>(key: string[], apiMethod: ApiMethod, options?: UseMutationOptions<any, Error, { id: string; payload: T }>) {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; payload: T }>({
    mutationFn: async ({ id, payload }) => {
      const { data: response } = await apiMethod(id, payload);
      return response.data ?? response;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); },
    ...options,
  });
}

export function useDelete(key: string[], apiMethod: ApiMethod, options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const { data: response } = await apiMethod(id);
      return response.data ?? response;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); },
    ...options,
  });
}
