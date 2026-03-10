import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {RouterProvider,createRouter} from "@tanstack/react-router"
import { routerTree } from './routers/rootrouter.js'
const router = createRouter({routeTree : routerTree})
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
