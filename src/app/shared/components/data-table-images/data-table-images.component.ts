import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { SharedTableColumn, SharedTagSeverity } from './data-table-images.types';

@Component({
  selector: 'sti-data-table-images',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ImageModule,
    InputTextModule
  ],
  templateUrl: './data-table-images.component.html',
  styleUrl: './data-table-images.component.css',
})
export class DataTableImagesComponent {
  @Input() title = 'Data Table';
  @Input() value: any[] = [];
  @Input() columns: SharedTableColumn[] = [];
  @Input() loading = false;

  @Input() paginator = true;
  @Input() rows = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];

  @Input() showAdd = false;
  @Input() showDelete = false;

  @Input() showGlobalFilter = true;
  @Input() globalFilterFields: string[] = [];

  @Input() addLabel = 'Add';
  @Input() deleteLabel = 'Delete';

  @Output() addClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();

  resolveFieldData(rowData: any, field: string): any {
    if (!rowData || !field) return null;

    return field.split('.').reduce((acc: any, key: string) => {
      return acc?.[key];
    }, rowData);
  }

  getCellValue(rowData: any, col: SharedTableColumn): any {
    return this.resolveFieldData(rowData, col.field);
  }

  getLabels(rowData: any, col: SharedTableColumn): string[] {
    const value = this.getCellValue(rowData, col);

    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  getImages(rowData: any, col: SharedTableColumn): string[] {
    const value = this.getCellValue(rowData, col);

    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
      return [value];
    }

    return [];
  }

  getVisibleImages(rowData: any, col: SharedTableColumn): string[] {
    const images = this.getImages(rowData, col);
    const max = col.imageMax ?? 5;

    return images.slice(0, max);
  }

  getHiddenImageCount(rowData: any, col: SharedTableColumn): number {
    const images = this.getImages(rowData, col);
    const max = col.imageMax ?? 5;

    return Math.max(images.length - max, 0);
  }

  formatCellDate(value: any): string {
    if (!value) return '-';

    try {
      return formatDate(value, 'MMM d, y • h:mm a', 'en-US');
    } catch {
      return String(value);
    }
  }

  getComputedGlobalFilterFields(): string[] {
    if (this.globalFilterFields.length) {
      return this.globalFilterFields;
    }

    return this.columns
      .filter((col) => col.type !== 'images')
      .map((col) => col.field);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onAdd() {
    this.addClicked.emit();
  }

  onDelete() {
    this.deleteClicked.emit();
  }
}
