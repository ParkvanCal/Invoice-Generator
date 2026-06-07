export interface JobBookEntry {
  jobID: string;
  clientName: string;
  qty: number;
  desc: string;
  unitPrice: number;
  total: number;
}

export interface DocumentDetails {
  clientName: string;
  addr: string;
  city: string;
  contact: string;
  repName: string;
  date: string;
  orderNum?: string;
  jobID: string;
}

export interface LineItem {
  id: string;
  qty: number;
  desc: string;
  unitPrice: number;
  total: number;
}

export interface DocumentState {
  type: 'QUOTE' | 'INVOICE';
  details: DocumentDetails;
  items: LineItem[];
}
