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
  workStatus?: string; // Optional: Done, Not Done, None, etc.
  downPayment?: number; // Optional down/part payment
  balance?: number; // Optional balance outstanding
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
