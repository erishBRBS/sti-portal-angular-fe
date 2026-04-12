export type SharedTableColumnType = 'text' | 'labels' | 'images' | 'date';

export type SharedTagSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

export interface SharedTableColumn {
  field: string;
  header: string;
  type?: SharedTableColumnType;
  sortable?: boolean;
  width?: string;
  className?: string;
  emptyText?: string;

  imageMax?: number;
}