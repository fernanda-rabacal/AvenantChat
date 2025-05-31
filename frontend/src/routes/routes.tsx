import { createBrowserRouter } from 'react-router-dom';
import ChatRoomsListPage from '@/pages/RoomsList/rooms-list-page';
import ChatRoom from '@/pages/Chat/chat';
import HomePage from '@/pages/Home/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/rooms',
    element: <ChatRoomsListPage />,
  },
  {
    path: '/rooms/chat',
    element: <ChatRoom />,
  },
]);
