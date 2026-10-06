import {
  Archive,
  CalendarClock,
  Database,
  FileDown,
  FilePlus2,
  FileSpreadsheet,
  FileUp,
  FolderOpen,
  Gavel,
  ListChecks,
  ListTodo,
  MailCheck,
  ReceiptText,
  Scale,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const iconByKey: Record<string, LucideIcon> = {
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
  BMG_REGISTER_LAW_SUIT: Scale,
  BMG_UPLOAD_DOCUMENTS: FileUp,
  BMG_UPDATES_DEFENSE: Gavel,
  BMG_UPDATES_AUDIENCES: CalendarClock,
  MERCANTIL_REGISTER_LAW_SUIT: Scale,
  MERCANTIL_UPDATES: Gavel,
  MERCANTIL_UPLOAD_DOCUMENTS: FileUp,
  MERCANTIL_REFUNDS: ReceiptText,
  MERCANTIL_BATCH_UPDATES: ListChecks,
  INTER_REGISTER_LAW_SUIT: Scale,
  INTER_UPLOAD_DOCUMENTS: FileUp,
  INTER_REFUNDS: ReceiptText,
  INTER_TASKS: ListTodo,
  INTER_UPDATES: ListChecks,
  INTER_APPEAL_TASKS: Gavel,
  BMG_CITE_SE_PRAZOS: CalendarClock,
  BMG_CITE_SE_COPIA_INTEGRAL: FileDown,
  BMG_CITE_SE_LAKE: Database,
  UNIDAS_TASKS: ListTodo,
  UNIDAS_PROCESS_CLOSURE: Gavel,
  UNIDAS_UPDATE_BATCH: ListChecks,
  UNIDAS_TASK_SUBSIDIES: FileUp,
  UNIDAS_TASK_REGISTER_VALUES: ReceiptText,
  UNIDAS_TASK_PAYMENT_INVOICE: ReceiptText,
  UNIDAS_TASK_VERIFY_ACCIDENT_CLAIM: CalendarClock,
  LOCALIZA_TASKS: ListTodo,
  LOCALIZA_PROCESS_CLOSURE: Gavel,
  LOCALIZA_UPLOAD_DOCUMENTS: FileUp,
  LOCALIZA_DOWNLOAD_DOCUMENTS: FileDown,
  LOCALIZA_TASKS_NOTIFY: ListChecks,
  LOCALIZA_UPDATE_BATCH: ListChecks,
  LOCALIZA_TASKS_BATCH: ListTodo,
  LOCALIZA_REFUNDS: ReceiptText,
  LOCALIZA_WORKFLOW_ELAW: Workflow,
};

const iconByCategory: Record<string, LucideIcon> = {
  CADASTRO: FilePlus2,
  ANDAMENTOS: ListChecks,
  PRAZOS_TAREFAS: CalendarClock,
  DOCUMENTOS: FolderOpen,
  FINANCEIRO: Wallet,
  ENCERRAMENTO: Archive,
};

export function serviceIcon(key: string): LucideIcon {
  return iconByKey[key] ?? FileSpreadsheet;
}

export function categoryIcon(key: string): LucideIcon {
  return iconByCategory[key] ?? FileSpreadsheet;
}
