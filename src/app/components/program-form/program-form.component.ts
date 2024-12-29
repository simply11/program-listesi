import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProgramService } from '../../services/program.service';
import { Program, ProgramWithIndex } from '../../models/program';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './program-form.component.html',
  styleUrl: './program-form.component.css'
})
export class ProgramFormComponent implements OnInit {
  programForm: FormGroup;
  editMode = false;
  editIndex: number | null = null;
  
  // Periyot seçeneklerini tanımlayalım
  periyotSecenekleri = [
    { value: 'Aylık', label: 'Aylık' },
    { value: 'Yıllık', label: 'Yıllık' }
  ];

  constructor(
    private fb: FormBuilder,
    private programService: ProgramService,
    private router: Router
  ) {
    this.programForm = this.fb.group({
      programIsmi: ['', Validators.required],
      programLink: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sifre: ['', Validators.required],
      accountSekli: [''],
      ucretli: [false],
      bitisTarihi: [''],
      kartNo: [''],
      periyot: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.programService.getDuzenlenenProgram().subscribe(program => {
      if (program) {
        this.editMode = true;
        this.editIndex = program.index;
        const programData = { ...program };
        delete (programData as any).index;
        this.programForm.patchValue(programData);
      }
    });
  }

  // Form validation için yardımcı metodlar
  isFieldInvalid(fieldName: string): boolean {
    const field = this.programForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.programForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Bu alan zorunludur';
      }
      if (control.errors['email']) {
        return 'Geçerli bir e-posta adresi giriniz';
      }
    }
    return '';
  }

  onSubmit() {
    if (this.programForm.valid) {
      const formValue = this.programForm.value;
      
      const program: Program = {
        programIsmi: formValue.programIsmi,
        programLink: formValue.programLink,
        email: formValue.email,
        sifre: formValue.sifre,
        accountSekli: formValue.accountSekli || '',
        ucretli: formValue.ucretli,
        bitisTarihi: formValue.bitisTarihi ? 
          new Date(formValue.bitisTarihi).toLocaleDateString('tr-TR') : '',
        kartNo: formValue.ucretli ? formValue.kartNo : '',
        periyot: formValue.periyot
      };

      if (this.editMode && this.editIndex !== null) {
        this.programService.updateProgram(this.editIndex, program);
      } else {
        this.programService.addProgram(program);
      }

      this.programForm.reset();
      this.editMode = false;
      this.editIndex = null;
      this.router.navigate(['/list']);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Lütfen tüm zorunlu alanları doldurun.'
      });
    }
  }

  get showKartNo() {
    return this.programForm.get('ucretli')?.value;
  }
}
