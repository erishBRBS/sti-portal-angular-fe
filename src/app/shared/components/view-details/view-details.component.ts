import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

export interface DetailField {
  label: string;
  value: string | number | null | undefined;
}

export interface DetailModalConfig {
  title: string;
  showProfile?: boolean;
  profileImage?: string;
  fields: DetailField[];
}

@Component({
  selector: 'sti-view-details',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule
  ],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.css',
})
export class ViewDetailsComponent {
  visible = false;
  currentID = 0;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() config: DetailModalConfig = {
    title: 'Details',
    showProfile: false,
    profileImage: '',
    fields: [],
  };

  onShowDialogDetails(): void {
    this,this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getDisplayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }
}
