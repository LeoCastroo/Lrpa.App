import Account from "./pages/account";
import Home from "./pages/home";
import Pendencies from "./pages/pendencies";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import ServiceIndex from "./pages/services";
import ServiceOverview from "./pages/services/overview";
import ServiceResults from "./pages/services/results";
import ServiceItems from "./pages/services/items";
import ServiceExecutions from "./pages/services/executions";
import ServiceDocs from "./pages/services/docs";
import ImportList from "./pages/services/imports";
import ImportNew from "./pages/services/imports/new";
import ImportDetails from "./pages/services/imports/details";
import Users from "./pages/users";
import Credentials from "./pages/credentials";
import ServiceJurimetria from "./pages/services/jurimetria";
import ServiceProcessos from "./pages/services/processos";
import ServiceProcessoDetails from "./pages/services/processos/details";

const routes = {
  public: [
    {
      path: "/login",
      Page: Login,
    },
    {
      path: "/forgot-password",
      Page: ForgotPassword,
    },
    {
      path: "/reset-password",
      Page: ResetPassword,
    },
  ],
  private: [
    {
      path: "/",
      Page: Home,
      title: "Início",
    },
    {
      path: "/pendencies",
      Page: Pendencies,
      title: "Central de Pendências",
    },
    {
      path: "/users",
      Page: Users,
      title: "Usuários",
    },
    {
      path: "/credentials",
      Page: Credentials,
      title: "Cofre de Credenciais",
    },
    {
      path: "/account",
      Page: Account,
      title: "Minha Conta",
    },
    {
      path: "/services/:serviceKey",
      Page: ServiceIndex,
      title: "Serviço",
    },
    {
      path: "/services/:serviceKey/overview",
      Page: ServiceOverview,
      title: "Visão geral",
    },
    {
      path: "/services/:serviceKey/results",
      Page: ServiceResults,
      title: "Resultados",
    },
    {
      path: "/services/:serviceKey/items",
      Page: ServiceItems,
      title: "Itens",
    },
    {
      path: "/services/:serviceKey/executions",
      Page: ServiceExecutions,
      title: "Execuções",
    },
    {
      path: "/services/:serviceKey/jurimetria",
      Page: ServiceJurimetria,
      title: "Jurimetria",
    },
    {
      path: "/services/:serviceKey/processos",
      Page: ServiceProcessos,
      title: "Processos",
    },
    {
      path: "/services/:serviceKey/processos/:id",
      Page: ServiceProcessoDetails,
      title: "Processo",
    },
    {
      path: "/services/:serviceKey/docs",
      Page: ServiceDocs,
      title: "Documentação",
    },
    {
      path: "/services/:serviceKey/imports",
      Page: ImportList,
      title: "Importações",
    },
    {
      path: "/services/:serviceKey/imports/new",
      Page: ImportNew,
      title: "Nova Importação",
    },
    {
      path: "/services/:serviceKey/imports/:id",
      Page: ImportDetails,
      title: "Importação",
    },
  ],
};

export default routes;
