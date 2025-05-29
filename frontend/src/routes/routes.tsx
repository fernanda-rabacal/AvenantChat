import { createBrowserRouter } from 'react-router-dom';
import RoomsListPage from '../pages/RoomsList/page';
import ChatRoom from '@/pages/ChatPage/page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RoomsListPage />,
  },
  {
    path: '/chat',
    element: <ChatRoom />,
  },
]);
