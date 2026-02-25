import { createBrowserRouter } from 'react-router-dom';
import ExamplePage from '@/routes/ExamplePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ExamplePage />,
  },
]);
