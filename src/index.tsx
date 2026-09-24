import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { version } from "../package.json";
import "./globals.css";
import routes from "./routes";
import { Toaster } from "./components/ui/sonner";
import PrivateLayout from "./components/ui/private-layout";
import NotFound from "./pages/404";

console.log(`
	------------------------------
	Environment: ${process.env.APP_ENV}
	code	   : ${process.env.NODE_ENV}
	Version    : ${version}
	------------------------------
`);

createRoot(document.getElementById("app") as HTMLDivElement).render(
  <BrowserRouter>
    <Routes>
      {routes.public.map(({ path, Page }) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      {routes.private.map(({ path, Page, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateLayout title={title}>
              <Page />
            </PrivateLayout>
          }
        />
      ))}
      <Route path={"*"} element={<NotFound />} />
    </Routes>
    <Toaster />
  </BrowserRouter>
);
