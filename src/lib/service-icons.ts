import {
  Archive,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CarFront,
  ClipboardCheck,
  Coins,
  Database,
  Eye,
  FileDown,
  FilePlus2,
  FileSpreadsheet,
  FileUp,
  FolderOpen,
  Gavel,
  Handshake,
  HeartPulse,
  Landmark,
  Layers,
  ListChecks,
  ListTodo,
  MailCheck,
  PackageCheck,
  Paperclip,
  ReceiptText,
  RefreshCw,
  Scale,
  ScrollText,
  ShieldCheck,
  Siren,
  Tags,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Um ícone por serviço, e NUNCA repetido dentro do mesmo cliente (o menu mostra todos os serviços
 * de um cliente juntos — ícones iguais viram uma lista indistinguível). Entre clientes, a mesma
 * função mantém o mesmo ícone (ex.: upload de documentos = FileUp), para o usuário reconhecer.
 * Serviço novo precisa entrar aqui: sem entrada, cai no ícone genérico de planilha.
 */
const iconByKey: Record<string, LucideIcon> = {
  // BMG
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
  BMG_REGISTER_LAW_SUIT: Scale,
  BMG_UPLOAD_DOCUMENTS: FileUp,
  BMG_UPDATES_DEFENSE: Gavel,
  BMG_UPDATES_AUDIENCES: CalendarClock,
  BMG_UPDATES_DEADLINES: CalendarCheck,
  BMG_UPDATES_LEGAL_DOCS: RefreshCw,
  BMG_WORKFLOWS_DEATH_INDICATION: HeartPulse,
  BMG_WORKFLOWS_JUDGE_REGISTRATION: Landmark,
  BMG_WORKFLOWS_CORRECT_REGISTRATION: ClipboardCheck,
  BMG_WORKFLOWS_DEADLINES_DEFENSE: ShieldCheck,
  BMG_WORKFLOWS_INJUNCTIONS: Siren,
  BMG_WORKFLOWS_NOTICE_FOR_TREATMENT: BellRing,
  BMG_WORKFLOWS_NOTICE_OF_REPRESENTATION: Handshake,
  BMG_WORKFLOWS_SUBSIDIES: PackageCheck,
  // CITE-SE
  BMG_CITE_SE_PRAZOS: CalendarClock,
  BMG_CITE_SE_COPIA_INTEGRAL: FileDown,
  BMG_CITE_SE_LAKE: Database,
  // Mercantil
  MERCANTIL_REGISTER_LAW_SUIT: Scale,
  MERCANTIL_UPDATES: Gavel,
  MERCANTIL_UPLOAD_DOCUMENTS: FileUp,
  MERCANTIL_REFUNDS: ReceiptText,
  MERCANTIL_BATCH_UPDATES: ListChecks,
  // Inter
  INTER_REGISTER_LAW_SUIT: Scale,
  INTER_UPLOAD_DOCUMENTS: FileUp,
  INTER_REFUNDS: ReceiptText,
  INTER_TASKS: ListTodo,
  INTER_UPDATES: ListChecks,
  INTER_APPEAL_TASKS: Gavel,
  // Unidas
  UNIDAS_TASKS: ListTodo,
  UNIDAS_PROCESS_CLOSURE: Archive,
  UNIDAS_UPDATE_BATCH: ListChecks,
  UNIDAS_TASK_SUBSIDIES: Paperclip,
  UNIDAS_TASK_REGISTER_VALUES: Coins,
  UNIDAS_TASK_PAYMENT_INVOICE: ReceiptText,
  UNIDAS_TASK_VERIFY_ACCIDENT_CLAIM: CarFront,
  // Localiza
  LOCALIZA_TASKS: ListTodo,
  LOCALIZA_PROCESS_CLOSURE: Archive,
  LOCALIZA_UPLOAD_DOCUMENTS: FileUp,
  LOCALIZA_DOWNLOAD_DOCUMENTS: FileDown,
  LOCALIZA_TASKS_NOTIFY: Eye,
  LOCALIZA_UPDATE_BATCH: ListChecks,
  LOCALIZA_TASKS_BATCH: Layers,
  LOCALIZA_REFUNDS: ReceiptText,
  LOCALIZA_WORKFLOW_ELAW: Workflow,
  // Vivo
  VIVO_UPDATES: Gavel,
  VIVO_UPDATES_PA: ScrollText,
  VIVO_UPLOAD_DOCUMENTS: FileUp,
  VIVO_OBJECT_UPDATER: Tags,
  VIVO_PROCESS_CLOSURE: Archive,
  VIVO_REGISTER_LAW_SUIT: Scale,
  VIVO_EMAIL_READER: MailCheck,
  // CVC e TOTVS (leitura de e-mails — o mesmo robô da Vivo, um cliente cada)
  CVC_EMAIL_READER: MailCheck,
  TOTVS_EMAIL_READER: MailCheck,
  // Direcional
  DIRECIONAL_UPLOAD_DOCUMENTS: FileUp,
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
