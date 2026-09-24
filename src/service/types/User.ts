export interface IUserContext {
  id: string;
  name: string;
  email: string;
  role: string; // "ADMIN" | "CLIENT"
  office: { id: string; name: string } | null;
}
