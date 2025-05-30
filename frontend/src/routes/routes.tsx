import { createBrowserRouter } from 'react-router-dom';
import RoomsListPage from '../pages/RoomsList/page';
import ChatRoom from '@/pages/Chat/page';
import HomePage from '@/pages/Home/page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/rooms',
    element: <RoomsListPage />,
  },
  {
    path: '/rooms/:roomId',
    element: <ChatRoom />,
  },
]);
