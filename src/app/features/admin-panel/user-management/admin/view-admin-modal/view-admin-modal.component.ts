import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './view-admin-modal.component.html',
  styleUrl: './view-admin-modal.component.css',
})
export class ViewAdminModalComponent {
  @Input() visible = true;

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

  close(): void {
    this.visible = false;
  }

  save(): void {
    console.log('Saved!', this.news);
  }
}
