import { default as user } from "./user";
import { default as services } from "./services";
import { default as imports } from "./imports";
import { default as panel } from "./panel";
import { default as pendencies } from "./pendencies";

export interface Pagination {
  page: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export default {
  user,
  services,
  imports,
  panel,
  pendencies,
};
