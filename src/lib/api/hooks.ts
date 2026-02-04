import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import type { AxiosRequestConfig } from 'axios';

interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  url: string;
  config?: AxiosRequestConfig;
}

interface UseApiMutationOptions<TData, TVariables> extends Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
> {
  method: 'post' | 'put' | 'patch' | 'delete';
  url: string | ((variables: TVariables) => string);
}

export function useApiQuery<TData = unknown>(
  queryKey: unknown[],
  { url, config, ...options }: UseApiQueryOptions<TData>,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<TData>(url, config);
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown>({
  method,
  url,
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const endpoint = typeof url === 'function' ? url(variables) : url;
      const response = await apiClient[method]<TData>(endpoint, variables);
      return response.data;
    },
    ...options,
  });
}
