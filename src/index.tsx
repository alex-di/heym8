import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import { useActor, useInterpret } from '@xstate/react';

import { GlobalStateContext, SplashScreen, StarrySky, LayoutContext} from './components';

import { appMachine, AppState } from './store';

import { HomePage , RoomPage,  } from './pages';
import { Layout } from './components/layout';
import { NotFoundPage } from './pages/NotFound';

let router = createBrowserRouter([
  {
    id: 'root',
    path: "/",
    element: <Layout />,
    // loader: rootLoader,
    children: [
      {
        // path: ":contract",
        // element: <ContractPage />,
        // // action: newNoteAction,
        // children: [{
          path: ':roomId',
          element: <RoomPage />,
          // loader: roomLoader,
        // }]
      },
      // {
      //   path: ":contract/:roomId",
      //   element: <RoomPage />,
      //   // action: noteAction,
      //   errorElement: <h2>Room not found</h2>,
      // },
      {
        path: "/",
        element: <HomePage />,
        // action: newNoteAction,
      },
      {
        path: "*",
        element: <NotFoundPage />,
        // action: newNoteAction,
      },
    ],
  },
]);

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}

const App = () => {
    const appService = useInterpret(appMachine)

    return <Container fluid>
        <StarrySky>
          <GlobalStateContext.Provider value={{ appService }} >
            <RouterProvider router={router} /> 
          </GlobalStateContext.Provider>
        </StarrySky>
    </Container>
} 


ReactDOM.render(
  <App></App>,
  document.getElementById('root'),
)