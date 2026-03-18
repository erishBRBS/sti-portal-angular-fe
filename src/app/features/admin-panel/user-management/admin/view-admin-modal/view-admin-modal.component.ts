import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface NewsDetails {
  thumbnail: string;
  title: string;
  campaign: string;
  body: string;
  datePublished: string;
  authors: string;
  newsType: string;
  uploaderDate: string;
  uploaderName: string;
  sdgs: string[];
}


@Component({
  selector: 'sti-view-admin-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './view-admin-modal.component.html',
  styleUrl: './view-admin-modal.component.css',
})
export class ViewAdminModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  visible = false;
  currentID = 0;

  news: NewsDetails = {
    thumbnail: 'assets/images/sample-news.jpg',
    title: '',
    campaign: 'Community engagement',
    body: 'An update on gender programs, targets, and community activities promoting equity. Campaign: Community engagement provides additional context and next steps.',
    datePublished: '2024-01-02T03:05:00',
    authors: 'Eugene S. Marquez, Elena G. Harley',
    newsType: 'Gender',
    uploaderDate: '2024-01-02',
    uploaderName: 'Seeder',
    sdgs: [
      'assets/images/sdg-10.png',
      'assets/images/sdg-17.png'
    ]
  };

  onShowDialogDetails(id: number): void {
    console.log('Details ID logs', id);
    this.currentID = id;
    this,this.visible = true;
  }

  close(): void {
    this.onSuccess.emit()
    this.visible = false;
  }

  save(): void {
    console.log('Saved!', this.news);
  }
}
