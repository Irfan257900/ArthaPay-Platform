import { useEffect } from "react";
import "../src/index.css";
import { RouterProvider } from "react-router";
import { useTranslation } from "react-i18next";
import AppRoutes from "./core/layout/appRoutes";
import URLStorage from "./core/layout/urlStorage"; 
import SessionWrapper from "./core/authentication/sessionWrapper";
const themes = import.meta.glob('/src/themes/*.css');
const clientName = window.runtimeConfig.VITE_CLIENT;
const themePath = `/src/themes/${clientName}.css`;
if (themes[themePath]) {
  themes[themePath]();
} else {
  console.warn(`Theme not found for client: ${clientName}. Loading default styles.`);
}
function App() {
  const { i18n } = useTranslation();
  // for multilingual support
  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);
  return (
    <SessionWrapper> 
      <RouterProvider router={AppRoutes}>
        <URLStorage />
      </RouterProvider>
    </SessionWrapper>
  );
}

export default App;
