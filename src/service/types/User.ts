export interface IUserContext {
  id: string;
  name: string;
  email: string;
  role: string; // "ADMIN" | "CLIENT"
  office: { id: string; name: string } | null;
  // Só liga a FUNCIONALIDADE do Cofre de Credenciais — não implica acesso a nenhum cliente
  // específico (isso é sempre derivado no backend a partir das permissões de serviço).
  hasVaultAccess: boolean;
}
