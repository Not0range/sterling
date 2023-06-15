import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Main from './routes/Main';
import Search from './routes/Search';
import About from './routes/About';
import App from './App';
import Product from './routes/Product';
import Category from './routes/Category';
import { Provider } from 'react-redux';
import { store } from './store';
import ProductForm from './routes/ProductForm';
import History from './routes/History';
import Bookmark from './routes/Bookmark';
import Cart from './routes/Cart';
import Orders from './routes/Orders';
import OrdersControl from './routes/OrdersControl';
import CategoryForm from './routes/CategoryForm';
import Shops from './routes/Shops';
import Discount from './routes/Discount';
import Payment from './routes/Payment';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Main />,
      },
      {
        path: '/search',
        element: <Search />
      },
      {
        path: '/product',
        element: <Product />
      },
      {
        path: '/category',
        element: <Category />
      },
      {
        path: '/product-form',
        element: <ProductForm />
      },
      {
        path: '/category-form',
        element: <CategoryForm />
      },
      {
        path: '/history',
        element: <History />
      },
      {
        path: '/bookmark',
        element: <Bookmark />
      },
      {
        path: '/cart',
        element: <Cart />
      },
      {
        path: '/orders',
        element: <Orders />
      },
      {
        path: '/orders/admin',
        element: <OrdersControl />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/shops',
        element: <Shops />
      },
      {
        path: '/discount',
        element: <Discount />
      },
      {
        path: '/payment',
        element: <Payment />
      },
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
