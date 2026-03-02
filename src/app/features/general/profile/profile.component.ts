import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UserProfile = {
  name: string;
  initials: string;
  department: string;
  id: string;
  email: string;
  load: string;
  photoUrl?: string; // saved photo url from server
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user: UserProfile = {
    name: 'Prof. Patrick Santos',
    initials: 'PS',
    department: 'Full-Time Faculty • IT Department',
    id: 'STI-BAC-2024-001',
    email: 'p.santos@sti.edu.ph',
    load: '21 Units • 6 Sections',
    photoUrl: '', // set this if may existing photo
  };

  isEditing = false;

  private originalName = '';
  private originalDepartment = '';
  private originalPhotoUrl = '';

  // ✅ for instant preview (shows immediately after selecting a file)
  photoPreviewUrl: string | null = null;
  private lastObjectUrl: string | null = null;

  // store file to upload on save
  selectedPhotoFile: File | null = null;

  startEdit() {
    this.originalName = this.user.name;
    this.originalDepartment = this.user.department;
    this.originalPhotoUrl = this.user.photoUrl || '';

    // reset upload state
    this.selectedPhotoFile = null;
    this.clearPreview();

    this.isEditing = true;
  }

  cancelEdit() {
    this.user.name = this.originalName;
    this.user.department = this.originalDepartment;

    // restore saved photo
    this.user.photoUrl = this.originalPhotoUrl;

    // cleanup preview + selected file
    this.selectedPhotoFile = null;
    this.clearPreview();

    this.isEditing = false;
  }

  saveChanges() {
    // update initials
    this.user.initials = this.computeInitials(this.user.name);

    // ✅ keep preview visible after save (optional UX)
    // NOTE: in real app, after upload, replace user.photoUrl with returned URL from backend
    if (this.photoPreviewUrl) {
      this.user.photoUrl = this.photoPreviewUrl;
    }

    // TODO:
    // 1) update profile: { name, department }
    // 2) if (this.selectedPhotoFile) upload photo (multipart/form-data)

    this.selectedPhotoFile = null;
    this.isEditing = false;
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const maxSizeMb = 3;
    const isTooLarge = file.size > maxSizeMb * 1024 * 1024;

    if (!isImage || isTooLarge) {
      input.value = '';
      return;
    }

    this.selectedPhotoFile = file;

    // ✅ instant preview using object URL
    if (this.lastObjectUrl) URL.revokeObjectURL(this.lastObjectUrl);
    this.lastObjectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl = this.lastObjectUrl;

    // allow re-select same file
    input.value = '';
  }

  private clearPreview() {
    if (this.lastObjectUrl) URL.revokeObjectURL(this.lastObjectUrl);
    this.lastObjectUrl = null;
    this.photoPreviewUrl = null;
  }

  private computeInitials(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}