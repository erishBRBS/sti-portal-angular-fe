import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';

export type StiColType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'boolean'
  | 'tag'
  | 'custom'
  | 'attachment';

export type StiTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

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

  exportable?: boolean;
  exportHeader?: string;
  exportValueGetter?: (row: T) => any;

  tagSeverity?: (row: T) => StiTagSeverity;
  tagLabel?: (row: T) => string;
  tagClass?: (row: T) => string;

  attachmentUrlGetter?: (row: T) => string;
  attachmentLabelGetter?: (row: T) => string;
  attachmentTypeGetter?: (row: T) => 'image' | 'file' | 'none';
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
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  @Input() value: T[] = [];
  @Input() columns: TableColumn<T>[] = [];

  @Input() title = '';
  @Input() subtitle = '';

  @Input() loading = false;
  @Input() striped = true;
  @Input() rowHover = true;

  @Input() showColumnFilters = false;
  @Input() showActions = false;
  @Input() actions: RowAction<T>[] = [];

  @Input() showImportCsv = false;
  @Input() showAdd = false;
  @Input() showDelete = false;
  @Input() importCsvLabel = 'Import';
  @Input() addLabel = 'Add';
  @Input() deleteLabel = 'Delete';

  @Input() showExportPdf = false;
  @Input() exportPdfLabel = 'Export PDF';
  @Input() exportPdfFileName = 'export-data.pdf';
  @Input() exportPdfTitle = '';
  @Input() exportPdfSubtitle = '';
  @Input() exportPdfMeta: string[] = [];
  @Input() exportPdfRows: T[] | null = null;

  @Input() showSelection = false;
  @Input() selection: T[] = [];
  @Output() selectionChange = new EventEmitter<T[]>();

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

  @Output() rowClicked = new EventEmitter<T>();
  @Output() actionClicked = new EventEmitter<ActionEvent<T>>();
  @Output() importCsvClicked = new EventEmitter<void>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();

  @Input() totalRecords = 0;
  @Input() lazy = false;
  @Output() pageChanged = new EventEmitter<PageChangedEvent>();

  selectedColumns: TableColumn<T>[] = [];

  get canExportPdf(): boolean {
    const rowsToExport = this.exportPdfRows?.length ? this.exportPdfRows : this.value;
    return this.isBrowser && !this.loading && !!rowsToExport && rowsToExport.length > 0;
  }

  getAttachmentUrl(row: T, col: TableColumn<T>): string {
    if (col.attachmentUrlGetter) return col.attachmentUrlGetter(row) ?? '';
    return '';
  }

  getAttachmentLabel(row: T, col: TableColumn<T>): string {
    if (col.attachmentLabelGetter) return col.attachmentLabelGetter(row) ?? '';
    return '';
  }

  getAttachmentType(row: T, col: TableColumn<T>): 'image' | 'file' | 'none' {
    if (col.attachmentTypeGetter) return col.attachmentTypeGetter(row);
    return 'none';
  }

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

  async onExportPdf(): Promise<void> {
    if (!this.canExportPdf) return;

    const rowsToExport = this.exportPdfRows?.length ? this.exportPdfRows : this.value;

    const exportColumns = this.visibleColumns.filter((col) => {
      if (col.exportable === false) return false;
      if (col.type === 'attachment') return false;
      if (col.type === 'custom' && !col.exportValueGetter) return false;
      return true;
    });

    if (!rowsToExport?.length || exportColumns.length === 0) return;

    const jsPdfModule: any = await import('jspdf');
    const autoTableModule: any = await import('jspdf-autotable');

    const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF;
    const autoTable = autoTableModule.default || autoTableModule.autoTable;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const marginX = 40;
    let currentY = 40;

    const title = this.exportPdfTitle || this.title || 'Exported Data';
    const subtitle = this.exportPdfSubtitle || this.subtitle || '';

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, currentY);

    currentY += 18;

    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, marginX, currentY);
      currentY += 16;
    }

    if (this.exportPdfMeta?.length) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      this.exportPdfMeta.forEach((item) => {
        doc.text(String(item), marginX, currentY);
        currentY += 12;
      });
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated At: ${new Date().toLocaleString()}`, marginX, currentY);

    currentY += 14;

    const headers = exportColumns.map((col) => col.exportHeader || col.header);

    const body = rowsToExport.map((row) =>
      exportColumns.map((col) => this.getExportCellValue(row, col))
    );

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: {
        left: marginX,
        right: marginX,
      },
      didDrawPage: (data: any) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - marginX, pageHeight - 20, {
          align: 'right',
        });
      },
    });

    doc.save(this.buildPdfFileName());
  }

  private getExportCellValue(row: T, col: TableColumn<T>): string {
    let value: any;

    if (col.exportValueGetter) {
      value = col.exportValueGetter(row);
    } else if (col.type === 'tag' && col.tagLabel) {
      value = col.tagLabel(row);
    } else {
      value = this.getCellValue(row, col);
    }

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (col.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private buildPdfFileName(): string {
    const fileName = this.exportPdfFileName || 'export-data.pdf';
    const withExtension = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    return withExtension
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  cols = [
    { field: 'academic_year', header: 'Academic Year', filter: true },
    { field: 'semester', header: 'Semester', filter: true },
  ];
}