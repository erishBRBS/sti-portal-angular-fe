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

export interface PageChangedEvent {
  page: number;
  perPage: number;
  first: number;
}

export interface TableColumn<T = any> {
  field: string;
  header: string;
  type?: StiColType;
  width?: string;
  align?: 'left' | 'center' | 'right';
  class?: string;
  headerClass?: string;
  visible?: boolean;

  sortable?: boolean;
  filter?: boolean;
  filterMatchMode?: 'contains' | 'equals' | 'startsWith';

  dateFormat?: string;
  currencyCode?: string;

  valueGetter?: (row: T) => any;

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
  standalone: true,
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
export class DataTableComponent<T = any> implements OnChanges {
  @Input() value: T[] = [];
  @Input() columns: TableColumn<T>[] = [];

  // Header
  @Input() title = '';
  @Input() subtitle = '';

  // Table behavior
  @Input() loading = false;
  @Input() striped = true;
  @Input() rowHover = true;

  // Filters / Actions
  @Input() showColumnFilters = false;
  @Input() showActions = false;
  @Input() actions: RowAction<T>[] = [];

  // Header buttons flags
  @Input() showImportCsv = false;
  @Input() showAdd = false;
  @Input() showDelete = false;
  @Input() importCsvLabel = 'Import .CSV';
  @Input() addLabel = 'Add';
  @Input() deleteLabel = 'Delete';

  // Checkbox selection
  @Input() showSelection = false;
  @Input() selection: T[] = [];
  @Output() selectionChange = new EventEmitter<T[]>();

  // Pagination (two-way)
  private _rows = 10;
  @Input() set rows(v: number) {
    this._rows = Number(v ?? 10);
  }
  get rows() {
    return this._rows;
  }
  @Output() rowsChange = new EventEmitter<number>();

  private _first = 0;
  @Input() set first(v: number) {
    this._first = Number(v ?? 0);
  }
  get first() {
    return this._first;
  }
  @Output() firstChange = new EventEmitter<number>();

  @Input() paginator = true;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];

  // Events
  @Output() rowClicked = new EventEmitter<T>();
  @Output() actionClicked = new EventEmitter<ActionEvent<T>>();
  @Output() importCsvClicked = new EventEmitter<void>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();

  @Input() totalRecords = 0;
  @Input() lazy = false;
  @Output() pageChanged = new EventEmitter<PageChangedEvent>();

  // Internal
  selectedColumns: TableColumn<T>[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      const initial = (this.columns || []).filter((c) => c.visible !== false);
      this.selectedColumns = [...initial];
    }
  }

  get visibleColumns(): TableColumn<T>[] {
    const set = new Set(this.selectedColumns.map((c) => c.field));
    return (this.columns || []).filter((c) => set.has(c.field));
  }

  onPage(e: any) {
    const nextRows = typeof e?.rows === 'number' ? e.rows : this._rows;
    const nextFirst = typeof e?.first === 'number' ? e.first : this._first;

    this._rows = nextRows;
    this._first = nextFirst;

    this.rowsChange.emit(this._rows);
    this.firstChange.emit(this._first);

    const zeroBasedPage =
      typeof e?.page === 'number' ? e.page : Math.floor(this._first / this._rows);

    const page = zeroBasedPage + 1;

    this.pageChanged.emit({
      page,
      perPage: this._rows,
      first: this._first,
    });
  }

  onRowClick(row: T) {
    this.rowClicked.emit(row);
  }

  fireAction(actionKey: string, row: T, ev: MouseEvent) {
    ev.stopPropagation();
    this.actionClicked.emit({ actionKey, row });
  }

  isActionVisible(action: RowAction<T>, row: T) {
    return action.visible ? action.visible(row) : true;
  }

  onImportCsv() {
    this.importCsvClicked.emit();
  }

  onAdd() {
    this.addClicked.emit();
  }

  onDelete() {
    this.deleteClicked.emit();
  }

  onSelectionChange(selected: T[]) {
    this.selection = selected;
    this.selectionChange.emit(selected);
  }

  // Helpers
  getAlignClass(col: TableColumn<T>): string {
    if (col.align === 'center') return 'text-center';
    if (col.align === 'right') return 'text-right';
    return 'text-left';
  }

  getWidthStyle(col: TableColumn<T>): any {
    return col.width ? { width: col.width } : null;
  }

  getCellValue(row: T, col: TableColumn<T>): any {
    if (!row) return null;
    if (col.valueGetter) return col.valueGetter(row);

    const path = col.field?.split('.') ?? [];
    let cur: any = row;
    for (const key of path) {
      if (cur == null) return null;
      cur = cur[key];
    }
    return cur;
  }

  get globalFilterFields(): string[] {
    return this.visibleColumns.map((c) => c.field);
  }
}
