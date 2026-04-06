import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ServerItem {
  name: string;
  ip: string;
  port: string;
  os: string;
  status: string;
  lastCheck: string;
}

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './servers.html',
  styleUrls: ['./servers.css']
})
export class Servers {
  query = '';
  showAdd = false;
  showOs = false;

  currentPage = 1;
  itemsPerPage = 6;

  servers: ServerItem[] = [
    { name: 'SRV-01', ip: '192.168.1.10', port: '22', os: 'Linux', status: 'Online', lastCheck: '10:00' },
    { name: 'SRV-02', ip: '192.168.1.11', port: '80', os: 'Ubuntu', status: 'Warning', lastCheck: '09:20' },
    { name: 'SRV-03', ip: '192.168.1.12', port: '22', os: 'Windows', status: 'Offline', lastCheck: '08:45' },
    { name: 'SRV-04', ip: '192.168.1.13', port: '21', os: 'Debian', status: 'Maintenance', lastCheck: '11:10' },
    { name: 'SRV-05', ip: '192.168.1.14', port: '22', os: 'Linux', status: 'Online', lastCheck: '12:00' },
    { name: 'SRV-06', ip: '192.168.1.15', port: '443', os: 'Ubuntu', status: 'Warning', lastCheck: '12:15' },
    { name: 'SRV-07', ip: '192.168.1.16', port: '22', os: 'CentOS', status: 'Online', lastCheck: '12:40' },
    { name: 'SRV-08', ip: '192.168.1.17', port: '8080', os: 'Windows', status: 'Offline', lastCheck: '13:00' },
    { name: 'SRV-09', ip: '192.168.1.18', port: '22', os: 'Linux', status: 'Online', lastCheck: '13:20' },
    { name: 'SRV-10', ip: '192.168.1.19', port: '3306', os: 'Ubuntu', status: 'Warning', lastCheck: '13:45' }
  ];

  form: ServerItem = {
    name: '',
    ip: '',
    port: '',
    os: '',
    status: 'Online',
    lastCheck: '--:--'
  };

  get filteredServers(): ServerItem[] {
    const q = this.query.trim().toLowerCase();

    if (!q) {
      return this.servers;
    }

    return this.servers.filter(server =>
      server.name.toLowerCase().includes(q) ||
      server.ip.toLowerCase().includes(q) ||
      server.port.toLowerCase().includes(q) ||
      server.os.toLowerCase().includes(q) ||
      server.status.toLowerCase().includes(q) ||
      server.lastCheck.toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredServers.length / this.itemsPerPage);
    return total > 0 ? total : 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedServers(): ServerItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredServers.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openAddServer(): void {
    this.showAdd = true;
  }

  closeAddServer(): void {
    this.showAdd = false;
    this.showOs = false;
    this.resetForm();
  }

  toggleOs(): void {
    this.showOs = !this.showOs;
  }

  chooseOs(os: string): void {
    this.form.os = os;
    this.showOs = false;
  }

  addServer(): void {
    if (
      !this.form.name.trim() ||
      !this.form.ip.trim() ||
      !this.form.port.trim() ||
      !this.form.os.trim()
    ) {
      return;
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newServer: ServerItem = {
      name: this.form.name.trim(),
      ip: this.form.ip.trim(),
      port: this.form.port.trim(),
      os: this.form.os.trim(),
      status: 'Online',
      lastCheck: `${hh}:${mm}`
    };

    this.servers = [newServer, ...this.servers];
    this.currentPage = 1;
    this.closeAddServer();
  }

  resetForm(): void {
    this.form = {
      name: '',
      ip: '',
      port: '',
      os: '',
      status: 'Online',
      lastCheck: '--:--'
    };
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value === 'online') return 'online';
    if (value === 'offline') return 'offline';
    if (value === 'warning') return 'warning';
    if (value === 'maintenance') return 'maintenance';

    return '';
  }
}