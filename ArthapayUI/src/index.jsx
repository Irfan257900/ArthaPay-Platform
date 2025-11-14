import React from "react";
import ReactDOM from "react-dom/client";
import "../src/assets/css/styles.css";
import '@progress/kendo-theme-default/dist/all.css';
import { store } from "./store";
import { Provider } from "react-redux";
import App from "./App";
import auth0Config from "./core/authentication/config";
import './i18n';
import Auth0ProviderWrapper from "./core/authentication/Auth0ProviderWrapper";
const rootDocument = window.document.documentElement;
const theme=localStorage.getItem('theme')
rootDocument.classList.add(theme || 'dark')
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <Provider store={store}>
        <Auth0ProviderWrapper {...auth0Config} useRefreshTokens={true} cacheLocation="localstorage">
          <App />
        </Auth0ProviderWrapper>
      </Provider>
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);
