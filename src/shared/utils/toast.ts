import { createElement } from 'react';
import toast from 'react-hot-toast';
import InfoCircleIcon from '@/assets/icons/info-circle.svg?react';

/**
 * Thin wrapper around react-hot-toast with consistent defaults.
 *
 * The optional `id` parameter prevents duplicate toasts — if a toast
 * with the same id is already visible, the call is a no-op.
 */
export const showToast = {
  success: (message: string, id?: string) => toast.success(message, { id, duration: 3000 }),

  error: (message: string, id?: string) => toast.error(message, { id, duration: 4000 }),

  info: (message: string, id?: string) =>
    toast(message, {
      id,
      duration: 3000,
      icon: createElement(InfoCircleIcon, {
        className: 'w-5 h-5 text-blue-400',
      }),
    }),
};
