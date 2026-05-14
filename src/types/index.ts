export type InvitationJenis =
  | 'nikah' | 'khitan' | 'walimah_safar' | 'pengajian'
  | 'wisuda' | 'gathering' | 'ulang_tahun' | 'aqiqah' | 'umum'

export interface InvitationParams {
  jenis:            InvitationJenis
  topik:            string
  isiAcara:         string
  mode:             'Light' | 'Dark' | 'Auto'
  gaya:             string
  warna:            string
  tipografi:        string
  layout:           string
  background:       string
  dekorasi:         string
  medsos:           string
  instruksiTambahan:string
  story?:           string
  dompetDigital?:   string
  acaraKedua?:      string
}

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface WizardState {
  step:   WizardStep
  params: Partial<InvitationParams>
}

export type UserRole = 'USER' | 'RESELLER' | 'ADMIN'
