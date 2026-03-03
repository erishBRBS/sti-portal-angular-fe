import { Component } from '@angular/core';
import { DataTableComponent, RowAction, TableColumn } from '../../../../shared/components/data-table/data-table.component';

type UserRow = {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string; // ISO
  balance: number;
};

@Component({
  selector: 'sti-admin',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminManagementComponent {
 loading = false;

  rows: UserRow[] = [
    { id: 1, name: 'Arvin', email: 'arvin@mail.com', status: 'Active', createdAt: '2026-03-01T10:00:00Z', balance: 1200 },
    { id: 2, name: 'Juan', email: 'juan@mail.com', status: 'Pending', createdAt: '2026-02-25T09:30:00Z', balance: 300 },
  ];

  cols: TableColumn<UserRow>[] = [
    { field: 'id', header: 'ID', sortable: true, filter: true, width: '90px', align: 'right' },
    { field: 'name', header: 'Name', sortable: true, filter: true },
    { field: 'email', header: 'Email', sortable: true, filter: true },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filter: true,
      type: 'tag',
      tagSeverity: (r) => (r.status === 'Active' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'),
    },
    { field: 'createdAt', header: 'Created', sortable: true, filter: true, type: 'datetime' },
    { field: 'balance', header: 'Balance', sortable: true, filter: true, type: 'currency', currencyCode: 'PHP', align: 'right' },
  ];

  actions: RowAction<UserRow>[] = [
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  onRow(row: UserRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: UserRow }) {
    console.log('action', e.actionKey, e.row);
  }
}
