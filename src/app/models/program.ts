export interface Program {
  programIsmi: string;
  programLink: string;
  email: string;
  sifre: string;
  accountSekli: string;
  ucretli: boolean | string;
  bitisTarihi: string;
  kartNo?: string;
}

// Düzenleme için genişletilmiş interface
export interface ProgramWithIndex extends Program {
  index: number;
} 