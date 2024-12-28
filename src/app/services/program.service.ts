import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Program, ProgramWithIndex } from '../models/program';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private storageKey = 'programlar';
  private programlar: Program[] = [];
  private programlarSubject = new BehaviorSubject<Program[]>([]);
  private duzenlenenProgramSubject = new BehaviorSubject<ProgramWithIndex | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.programlar = JSON.parse(data);
      this.programlarSubject.next(this.programlar);
    }
  }

  getProgramlar() {
    return this.programlarSubject.asObservable();
  }

  getDuzenlenenProgram() {
    return this.duzenlenenProgramSubject.asObservable();
  }

  setDuzenlenenProgram(program: ProgramWithIndex | null) {
    this.duzenlenenProgramSubject.next(program);
  }

  addProgram(program: Program) {
    this.programlar = [...this.programlar, program];
    this.updateStorage();
    Swal.fire({
      icon: 'success',
      title: 'Başarılı!',
      text: 'Program başarıyla eklendi.',
      showConfirmButton: false,
      timer: 1500
    });
  }

  updateProgram(index: number, program: Program) {
    this.programlar[index] = program;
    this.updateStorage();
    this.setDuzenlenenProgram(null);
    Swal.fire({
      icon: 'success',
      title: 'Başarılı!',
      text: 'Program başarıyla güncellendi.',
      showConfirmButton: false,
      timer: 1500
    });
  }

  deleteProgram(index: number) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu programı silmek istediğinizden emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.programlar.splice(index, 1);
        this.updateStorage();
        Swal.fire(
          'Silindi!',
          'Program başarıyla silindi.',
          'success'
        );
      }
    });
  }

  private updateStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.programlar));
    this.programlarSubject.next([...this.programlar]);
  }

  exportData() {
    const data = JSON.stringify(this.programlar, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    
    a.href = url;
    a.download = `program-listesi-${date}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  importData(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (Array.isArray(data) && data.every(this.isProgramValid)) {
            this.programlar = data;
            this.updateStorage();
            Swal.fire({
              icon: 'success',
              title: 'Başarılı!',
              text: 'Veriler başarıyla yüklendi.',
              showConfirmButton: false,
              timer: 1500
            });
            resolve();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata!',
              text: 'Geçersiz dosya formatı'
            });
            reject(new Error('Geçersiz dosya formatı'));
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: 'Dosya işlenirken bir hata oluştu'
          });
          reject(error);
        }
      };

      reader.onerror = () => {
        Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: 'Dosya okunamadı'
        });
        reject(new Error('Dosya okunamadı'));
      };
      reader.readAsText(file);
    });
  }

  private isProgramValid(item: any): boolean {
    return (
      typeof item === 'object' &&
      typeof item.programIsmi === 'string' &&
      typeof item.programLink === 'string' &&
      typeof item.email === 'string' &&
      typeof item.sifre === 'string' &&
      typeof item.accountSekli === 'string' &&
      (typeof item.ucretli === 'boolean' || typeof item.ucretli === 'string') &&
      typeof item.bitisTarihi === 'string'
    );
  }
} 