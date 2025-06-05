import { createBrowserRouter } from 'react-router-dom';
import ChatRoomsListPage from '@/pages/RoomsList/rooms-list-page';
import ChatRoom from '@/pages/Chat/chat';
import HomePage from '@/pages/Home/home';
import PrivateRoute from './private-route'; 

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/rooms',
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <ChatRoomsListPage />,
      },
    ],
  },
  {
    path: '/rooms/chat',
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <ChatRoom />,
      },
    ],
  },
]);