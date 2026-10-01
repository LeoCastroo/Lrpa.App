import * as Sentry from "@sentry/react";
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

// Sem SENTRY_DSN embutido no build (vite.config.ts), é um no-op seguro — igual ao backend.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV,
    release: version,
  });
}

function ErrorFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        O erro já foi registrado. Tente recarregar a página.
      </p>
    </div>
  );
}

createRoot(document.getElementById("app") as HTMLDivElement).render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
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
  </Sentry.ErrorBoundary>
);
