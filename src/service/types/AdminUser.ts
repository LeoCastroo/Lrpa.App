/** Usuário CLIENT de um escritório, visto pelo ADMIN, com os serviços que ele acessa hoje. */
export interface IOfficeUserSummary {
  id: string;
  name: string;
  email: string;
  status: string;
  serviceKeys: string[];
}

export interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
  office: string;
  serviceKeys: string[];
}
