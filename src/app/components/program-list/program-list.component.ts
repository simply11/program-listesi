import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramService } from '../../services/program.service';
import { Program, ProgramWithIndex } from '../../models/program';

type SortableColumns = keyof Program;

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css'
})
export class ProgramListComponent implements OnInit {
  programlar: Program[] = [];
  filteredProgramlar: Program[] = [];
  searchTerm: string = '';
  sort: { column: SortableColumns | null; direction: 'asc' | 'desc' } = {
    column: null,
    direction: 'asc'
  };

  constructor(
    private programService: ProgramService,
    private router: Router
  ) {}

  ngOnInit() {
    this.programService.getProgramlar().subscribe({
      next: (data) => {
        this.programlar = data;
        this.applyFilters();
      }
    });
  }

  // Export/Import metodları
  exportData() {
    this.programService.exportData();
  }

  importData(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.programService.importData(input.files[0])
        .then(() => {
          input.value = '';
        })
        .catch(error => {
          console.error('Import error:', error);
          input.value = '';
        });
    }
  }

  // Kart no formatlama
  formatKartNo(kartNo: string | undefined): string {
    if (!kartNo) return '-';
    return kartNo;
  }

  // Arama ve filtreleme metodları
  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.programlar];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(program => {
        return (
          program.programIsmi.toLowerCase().includes(term) ||
          program.programLink.toLowerCase().includes(term) ||
          program.email.toLowerCase().includes(term) ||
          program.sifre.toLowerCase().includes(term) ||
          program.accountSekli.toLowerCase().includes(term) ||
          (program.kartNo && program.kartNo.toLowerCase().includes(term)) ||
          program.bitisTarihi.toLowerCase().includes(term)
        );
      });
    }

    if (this.sort.column) {
      filtered.sort((a, b) => {
        const aVal = String(a[this.sort.column!]);
        const bVal = String(b[this.sort.column!]);
        return this.sort.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    this.filteredProgramlar = filtered;
  }

  // Sıralama metodları
  sortBy(column: SortableColumns) {
    if (this.sort.column === column) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort.column = column;
      this.sort.direction = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: SortableColumns): string {
    if (this.sort.column !== column) return '↕️';
    return this.sort.direction === 'asc' ? '↑' : '↓';
  }

  // Navigasyon metodları
  navigateToForm() {
    this.router.navigate(['/form']);
  }

  editProgram(program: Program, index: number) {
    this.programService.setDuzenlenenProgram({...program, index});
    this.router.navigate(['/form']);
  }

  deleteProgram(index: number) {
    this.programService.deleteProgram(index);
  }
}
