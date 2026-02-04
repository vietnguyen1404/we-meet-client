import { RouterProvider } from 'react-router-dom';
import { router } from '@/config/router';

export default function App() {
  return <RouterProvider router={router} />;
}
