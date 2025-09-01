export interface DevisRequestDTO {
  requestId: number;
  agentId: number | null;
  centerId: number | null;
  amount: number;
  date: string; // yyyy-MM-dd
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
  clientId?: string;
  clientName?: string;
}

export interface DevisResponseDTO {
  id: number;
  requestId: number | null;
  agentId: number | null;
  centerId: number | null;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
  clientId?: string;
  clientName?: string;
}
