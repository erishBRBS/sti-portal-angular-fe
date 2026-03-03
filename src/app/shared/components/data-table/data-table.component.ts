import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';

export type StiColType = 'text' | 'date' | 'datetime' | 'currency' | 'boolean' | 'tag' | 'custom';
export type StiTagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';

export interface TableColumn<T = any> {
  field: string;           
  header: string;

  // UI
  type?: StiColType;
  width?: string;
  align?: 'left' | 'center' | 'right';
  class?: string;
  headerClass?: string;
  visible?: boolean;

  // Sort/Filter
  sortable?: boolean;
  filter?: boolean;
  filterMatchMode?: 'contains' | 'equals' | 'startsWith';

  // Formatting
  dateFormat?: string;      
  currencyCode?: string;    

  // Custom value
  valueGetter?: (row: T) => any;

  // Tag helpers
  tagSeverity?: (row: T) => StiTagSeverity;
  tagLabel?: (row: T) => string;
}

export interface RowAction<T = any> {
  key: string;
  label: string;
  icon?: string;         
  tooltip?: string;
  buttonClass?: string;    
  visible?: (row: T) => boolean;
}

export interface ActionEvent<T = any> {
  actionKey: string;
  row: T;
}


@Component({
  selector: 'sti-data-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    TooltipModule,
    TagModule,
    SkeletonModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T = any> implements OnChanges  {
// Data + columns
  @Input() value: T[] = [];
  @Input() columns: TableColumn<T>[] = [];

  // Header
  @Input() title = '';
  @Input() subtitle = '';

  // Table behavior
  @Input() loading = false;
  @Input() striped = true;
  @Input() rowHover = true;

  // Pagination
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // Filtering
  @Input() showGlobalSearch = true;
  @Input() showColumnFilters = false; 
  @Input() globalSearchPlaceholder = 'Search...';

  // Column toggler
  @Input() showColumnToggler = true;

  // Actions
  @Input() showActions = false;
  @Input() actions: RowAction<T>[] = [];

  // Events
  @Output() rowClicked = new EventEmitter<T>();
  @Output() actionClicked = new EventEmitter<ActionEvent<T>>();

  // Internal state
  selectedColumns: TableColumn<T>[] = [];
  globalSearchValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      const initial = (this.columns || []).filter(c => c.visible !== false);
      this.selectedColumns = [...initial];
    }
  }

  get visibleColumns(): TableColumn<T>[] {
    const set = new Set(this.selectedColumns.map(c => c.field));
    return (this.columns || []).filter(c => set.has(c.field));
  }

  get globalFilterFields(): string[] {
    // only columns that have field + visible
    return this.visibleColumns.map(c => c.field);
  }

  getCellValue(row: T, col: TableColumn<T>): any {
    if (!row) return null;

    if (col.valueGetter) return col.valueGetter(row);

    const path = col.field?.split('.') ?? [];
    let cur: any = row;

    for (const key of path) {
      if (cur == null) return null;
      cur = cur[key as keyof typeof cur];
    }

    return cur;
  }

  getAlignClass(col: TableColumn<T>): string {
    if (col.align === 'center') return 'text-center';
    if (col.align === 'right') return 'text-right';
    return 'text-left';
  }

  getWidthStyle(col: TableColumn<T>): any {
    return col.width ? { width: col.width } : null;
  }

  onRowClick(row: T): void {
    this.rowClicked.emit(row);
  }

  isActionVisible(action: RowAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  fireAction(actionKey: string, row: T, ev: MouseEvent): void {
    ev.stopPropagation();
    this.actionClicked.emit({ actionKey, row });
  }
}
