/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Layers, 
  Printer, 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  Briefcase,
  AlertCircle,
  TrendingUp,
  Download,
  Search,
  Upload,
  Pencil,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { JobBookEntry, DocumentDetails, LineItem, DocumentState } from "./types";
// @ts-ignore
import companyLogoImage from "./assets/images/company_logo_1780762745301.png";

export default function App() {
  const companyLogo = companyLogoImage;

  // Navigation & View Tab
  const [activeTab, setActiveTab] = useState<'quote' | 'invoice' | 'job_book' | 'design_docs'>('quote');
  
  // Simulated Excel sheets database with fallback and localStorage persistence
  const [jobBook, setJobBook] = useState<JobBookEntry[]>(() => {
    // One-time forced migration to ensure users immediately load the new Masimba Holdings PDF data
    const migrated = localStorage.getItem("excel_app_migrated_masimba_v5");
    if (!migrated) {
      localStorage.setItem("excel_app_migrated_masimba_v5", "true");
      localStorage.removeItem("excel_app_jobBook");
      localStorage.removeItem("excel_app_finalizedQuotes");
    }

    const saved = localStorage.getItem("excel_app_jobBook");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading jobBook from localStorage:", e);
      }
    }
    return [
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Calibration of 5000 Liter Bowser MFB 005", unitPrice: 150.00, total: 150.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Calibration of flow meter MFB 00575", unitPrice: 75.00, total: 75.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Tank Calibration Of 28000 Liter HMT 003", unitPrice: 350.00, total: 350.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Tank Integrity Test on 28000L (6 Compartment) HMT 003", unitPrice: 300.00, total: 300.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Tank cleaning on 28000L (6 Compartment) HMT 003", unitPrice: 350.00, total: 350.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Supply Commercial Dispenser (Sanki Classic SK52-120LPM)", unitPrice: 9500.00, total: 9500.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "1 Installation and Calibration Commercial Pump Dispenser", unitPrice: 150.00, total: 150.00 },
      { jobID: "01MAS26", clientName: "MASIMBA HOLDINGS LIMITED", qty: 1, desc: "Mileage", unitPrice: 50.00, total: 50.00 }
    ];
  });

  // List of finished Quotes that can be compiled to Invoices (Stage 3/4)
  const [finalizedQuotes, setFinalizedQuotes] = useState<{
    id: string;
    details: DocumentDetails;
    items: LineItem[];
    subtotal: number;
  }[]>(() => {
    const saved = localStorage.getItem("excel_app_finalizedQuotes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading finalizedQuotes from localStorage:", e);
      }
    }
    return [
      {
        id: "01MAS26",
        details: {
          jobID: "01MAS26",
          clientName: "MASIMBA HOLDINGS LIMITED",
          addr: "44 Tilbury Road, Willowvale",
          city: "Harare",
          contact: "Natasha",
          repName: "Upenyu",
          date: "2026-04-29"
        },
        items: [
          { id: "1", qty: 1, desc: "Calibration of 5000 Liter Bowser MFB 005", unitPrice: 150.00, total: 150.00 },
          { id: "2", qty: 1, desc: "Calibration of flow meter MFB 00575", unitPrice: 75.00, total: 75.00 },
          { id: "3", qty: 1, desc: "Tank Calibration Of 28000 Liter HMT 003", unitPrice: 350.00, total: 350.00 },
          { id: "4", qty: 1, desc: "Tank Integrity Test on 28000L (6 Compartment) HMT 003", unitPrice: 300.00, total: 300.00 },
          { id: "5", qty: 1, desc: "Tank cleaning on 28000L (6 Compartment) HMT 003", unitPrice: 350.00, total: 350.00 },
          { id: "6", qty: 1, desc: "Supply Commercial Dispenser (Sanki Classic SK52-120LPM)", unitPrice: 9500.00, total: 9500.00 },
          { id: "7", qty: 1, desc: "1 Installation and Calibration Commercial Pump Dispenser", unitPrice: 150.00, total: 150.00 },
          { id: "8", qty: 1, desc: "Mileage", unitPrice: 50.00, total: 50.00 }
        ],
        subtotal: 10925.00
      }
    ];
  });

  // Persist state updates to browser localStorage
  useEffect(() => {
    localStorage.setItem("excel_app_jobBook", JSON.stringify(jobBook));
  }, [jobBook]);

  useEffect(() => {
    localStorage.setItem("excel_app_finalizedQuotes", JSON.stringify(finalizedQuotes));
  }, [finalizedQuotes]);

  // Active form inputs for Creating Quotation
  const [quoteForm, setQuoteForm] = useState({
    clientName: "MASIMBA HOLDINGS LIMITED",
    addr: "44 Tilbury Road, Willowvale",
    city: "Harare",
    contact: "Natasha",
    repName: "Upenyu",
    date: "2026-04-29",
    workStatus: "None",
    downPayment: 0
  });

  // Items currently being build in Quotation creator
  const [activeQuoteItems, setActiveQuoteItems] = useState<LineItem[]>([
    { id: "1", qty: 1, desc: "Calibration of 5000 Liter Bowser MFB 005", unitPrice: 150.00, total: 150.00 },
    { id: "2", qty: 1, desc: "Calibration of flow meter MFB 00575", unitPrice: 75.00, total: 75.00 },
    { id: "3", qty: 1, desc: "Tank Calibration Of 28000 Liter HMT 003", unitPrice: 350.00, total: 350.00 },
    { id: "4", qty: 1, desc: "Tank Integrity Test on 28000L (6 Compartment) HMT 003", unitPrice: 300.00, total: 300.00 },
    { id: "5", qty: 1, desc: "Tank cleaning on 28000L (6 Compartment) HMT 003", unitPrice: 350.00, total: 350.00 },
    { id: "6", qty: 1, desc: "Supply Commercial Dispenser (Sanki Classic SK52-120LPM)", unitPrice: 9500.00, total: 9500.00 },
    { id: "7", qty: 1, desc: "1 Installation and Calibration Commercial Pump Dispenser", unitPrice: 150.00, total: 150.00 },
    { id: "8", qty: 1, desc: "Mileage", unitPrice: 50.00, total: 50.00 }
  ]);

  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemDesc, setNewItemDesc] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  // States for editing active line items inline
  const [editingLineItemId, setEditingLineItemId] = useState<string | null>(null);
  const [editingLineItemQty, setEditingLineItemQty] = useState<number>(1);
  const [editingLineItemDesc, setEditingLineItemDesc] = useState<string>("");
  const [editingLineItemPrice, setEditingLineItemPrice] = useState<number>(0);

  // States for editing comments inline
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>("");

  // Selected Quote ID for editing / reviewing
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editedQuoteId, setEditedQuoteId] = useState<string>("");

  // Active Invoice inputs
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("01MAS26");
  const [invoiceOrderNum, setInvoiceOrderNum] = useState<string>("Verbal");
  const [invoiceDate, setInvoiceDate] = useState<string>("2026-04-29");

  // Document rendered in sheet frame (WYSIWYG)
  const [sheetDoc, setSheetDoc] = useState<DocumentState>({
    type: 'QUOTE',
    details: {
      jobID: "01MAS26",
      clientName: "MASIMBA HOLDINGS LIMITED",
      addr: "44 Tilbury Road, Willowvale",
      city: "Harare",
      contact: "Natasha",
      repName: "Upenyu",
      date: "2026-04-29",
      workStatus: "None",
      downPayment: 0
    },
    items: [
      { id: "1", qty: 1, desc: "Calibration of 5000 Liter Bowser MFB 005", unitPrice: 150.00, total: 150.00 },
      { id: "2", qty: 1, desc: "Calibration of flow meter MFB 00575", unitPrice: 75.00, total: 75.00 },
      { id: "3", qty: 1, desc: "Tank Calibration Of 28000 Liter HMT 003", unitPrice: 350.00, total: 350.00 },
      { id: "4", qty: 1, desc: "Tank Integrity Test on 28000L (6 Compartment) HMT 003", unitPrice: 300.00, total: 300.00 },
      { id: "5", qty: 1, desc: "Tank cleaning on 28000L (6 Compartment) HMT 003", unitPrice: 350.00, total: 350.00 },
      { id: "6", qty: 1, desc: "Supply Commercial Dispenser (Sanki Classic SK52-120LPM)", unitPrice: 9500.00, total: 9500.00 },
      { id: "7", qty: 1, desc: "1 Installation and Calibration Commercial Pump Dispenser", unitPrice: 150.00, total: 150.00 },
      { id: "8", qty: 1, desc: "Mileage", unitPrice: 50.00, total: 50.00 }
    ]
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCurrency, setActiveCurrency] = useState("$");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Corporate Branding State & Persistent Parameters
  const [brCompanyName, setBrCompanyName] = useState(() => {
    return localStorage.getItem("excel_app_companyName") || "Parkvan Calibration™ (Pvt) Ltd";
  });
  const [brCompanyTagline, setBrCompanyTagline] = useState(() => {
    return localStorage.getItem("excel_app_companyTagline") || "PRECISION. RELIABILITY. COMPLIANCE.";
  });
  const [brCompanyFooterTagline, setBrCompanyFooterTagline] = useState(() => {
    return localStorage.getItem("excel_app_companyFooterTagline") || "YOUR TRUSTED WETSTOCK & CALIBRATION PARTNER™";
  });
  const [brCompanyAddress, setBrCompanyAddress] = useState(() => {
    return localStorage.getItem("excel_app_companyAddress") || "119 Harare Drive, Hatfield, HARARE";
  });
  const [brCompanyEmail, setBrCompanyEmail] = useState(() => {
    return localStorage.getItem("excel_app_companyEmail") || "info@parkvan-calibration.co.zw";
  });
  const [brCompanyPhone, setBrCompanyPhone] = useState(() => {
    return localStorage.getItem("excel_app_companyPhone") || "0778 924 209";
  });
  const [brCompanyLogo, setBrCompanyLogo] = useState(() => {
    const saved = localStorage.getItem("excel_app_companyLogo");
    if (saved === "/src/assets/images/company_logo_1780762745301.png") {
      return companyLogo;
    }
    return saved || companyLogo;
  });
  const [brShowLogo, setBrShowLogo] = useState(() => {
    const saved = localStorage.getItem("excel_app_showLogo");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [excelStyleMode, setExcelStyleMode] = useState<'excel' | 'clean'>(() => {
    return (localStorage.getItem("excel_app_styleMode") as 'excel' | 'clean') || 'clean'; // Default to clean layout since the user wants the exact layout of the PDF
  });

  const [quoteComments, setQuoteComments] = useState<string[]>(() => {
    const saved = localStorage.getItem("excel_app_quote_comments_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const permanentComment = "Kindly permit us to use your logo and completed works for advertising and social media promotional purposes.";
          const filtered = parsed.filter(c => c !== permanentComment);
          return [permanentComment, ...filtered];
        }
      } catch (e) {
        // ignore
      }
    }
    return [
      "Kindly permit us to use your logo and completed works for advertising and social media promotional purposes."
    ];
  });

  useEffect(() => {
    localStorage.setItem("excel_app_companyName", brCompanyName);
  }, [brCompanyName]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyTagline", brCompanyTagline);
  }, [brCompanyTagline]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyFooterTagline", brCompanyFooterTagline);
  }, [brCompanyFooterTagline]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyAddress", brCompanyAddress);
  }, [brCompanyAddress]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyEmail", brCompanyEmail);
  }, [brCompanyEmail]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyPhone", brCompanyPhone);
  }, [brCompanyPhone]);

  useEffect(() => {
    localStorage.setItem("excel_app_companyLogo", brCompanyLogo);
  }, [brCompanyLogo]);

  useEffect(() => {
    localStorage.setItem("excel_app_showLogo", JSON.stringify(brShowLogo));
  }, [brShowLogo]);

  useEffect(() => {
    localStorage.setItem("excel_app_styleMode", excelStyleMode);
  }, [excelStyleMode]);

  useEffect(() => {
    localStorage.setItem("excel_app_quote_comments_v1", JSON.stringify(quoteComments));
  }, [quoteComments]);

  // Dynamic Document Title for OS Print default naming system
  useEffect(() => {
    const cleanClient = (sheetDoc.details.clientName || 'CLIENT')
      .replace(/[^a-zA-Z0-9\s]/g, '') // remove special characters
      .trim()
      .replace(/\s+/g, '_')          // replace spaces with underscores
      .toUpperCase();
    const docId = (sheetDoc.details.jobID || 'DOCUMENT').trim().replace(/\s+/g, '_').toUpperCase();
    const docType = (sheetDoc.type || 'DOCUMENT').trim().toUpperCase();
    
    document.title = `${docId}_${cleanClient}_${docType}`;
  }, [sheetDoc.details.clientName, sheetDoc.details.jobID, sheetDoc.type]);

  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBrCompanyLogo(event.target.result);
        setBrShowLogo(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Trigger system OS print dialogue (also auto-saves and logs state if printing a quotation)
  const handlePrintDocument = () => {
    if (sheetDoc.type === 'QUOTE') {
      if (activeQuoteItems.length === 0) {
        alert("Please add at least one item before printing the quotation.");
        return;
      }
      
      if (editingQuoteId) {
        // Mode: Reviewing/editing an existing quote - update the database & logs
        const finalQuoteId = editedQuoteId.trim() || editingQuoteId;
        const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
        const updatedQuote = {
          id: finalQuoteId,
          details: {
            jobID: finalQuoteId,
            ...quoteForm
          },
          items: [...activeQuoteItems],
          subtotal
        };

        setFinalizedQuotes(prev => {
          const filtered = prev.filter(q => q.id !== editingQuoteId && q.id !== finalQuoteId);
          return [...filtered, updatedQuote];
        });

        const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
          jobID: finalQuoteId,
          clientName: quoteForm.clientName,
          qty: item.qty,
          desc: item.desc,
          unitPrice: item.unitPrice,
          total: item.total
        }));

        setJobBook(prev => {
          const filtered = prev.filter(e => e.jobID !== editingQuoteId && e.jobID !== finalQuoteId);
          return [...filtered, ...newEntries];
        });

        setSheetDoc({
          type: 'QUOTE',
          details: {
            ...quoteForm,
            jobID: finalQuoteId
          },
          items: [...activeQuoteItems]
        });

        setSelectedQuoteId(finalQuoteId);
        setEditingQuoteId(null);
        setEditedQuoteId("");
        alert(`Quotation Reference: ${finalQuoteId} has been successfully updated, logged to Job Book, and prepared for printing.`);
      } else {
        // Mode: Fresh draft or quick print of an already saved quote.
        const currentID = sheetDoc.details.jobID;
        const existsInLogs = finalizedQuotes.some(q => q.id === currentID && currentID !== "DRAFT" && currentID !== "01MAS26");

        if (existsInLogs) {
          // Already saved, let's update it in-place to make sure any modifications are synchronized
          const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
          const updatedQuote = {
            id: currentID,
            details: {
              jobID: currentID,
              ...quoteForm
            },
            items: [...activeQuoteItems],
            subtotal
          };

          setFinalizedQuotes(prev => prev.map(q => q.id === currentID ? updatedQuote : q));

          const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
            jobID: currentID,
            clientName: quoteForm.clientName,
            qty: item.qty,
            desc: item.desc,
            unitPrice: item.unitPrice,
            total: item.total
          }));

          setJobBook(prev => {
            const filtered = prev.filter(e => e.jobID !== currentID);
            return [...filtered, ...newEntries];
          });

          alert(`Changes to saved Quotation ${currentID} have been auto-saved and logged before printing.`);
        } else {
          // Fresh draft needs a new unique ID and a complete log entry 
          const generatedID = generateJobID(quoteForm.clientName);
          
          const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
            jobID: generatedID,
            clientName: quoteForm.clientName,
            qty: item.qty,
            desc: item.desc,
            unitPrice: item.unitPrice,
            total: item.total
          }));

          setJobBook(prev => [...prev, ...newEntries]);

          const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
          const newFinalized = {
            id: generatedID,
            details: {
              jobID: generatedID,
              ...quoteForm
            },
            items: [...activeQuoteItems],
            subtotal
          };

          setFinalizedQuotes(prev => {
            const filtered = prev.filter(q => q.id !== generatedID);
            return [...filtered, newFinalized];
          });

          setSelectedQuoteId(generatedID);

          setSheetDoc({
            type: 'QUOTE',
            details: {
              ...quoteForm,
              jobID: generatedID
            },
            items: [...activeQuoteItems]
          });

          alert(`Quotation auto-saved and logged to Job Book under Reference: ${generatedID} before printing.`);
        }
      }
    }

    // Trigger standard system OS print dialog
    window.print();
  };

  // Trigger modern canvas rendering to PDF (ideal for Android mobile, tablets, and offline downloads)
  const handleDownloadPDF = async () => {
    if (sheetDoc.type === 'QUOTE') {
      if (activeQuoteItems.length === 0) {
        alert("Please add at least one item before downloading the PDF.");
        return;
      }
      
      if (editingQuoteId) {
        // Mode: Reviewing/editing an existing quote - update the database & logs
        const finalQuoteId = editedQuoteId.trim() || editingQuoteId;
        const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
        const updatedQuote = {
          id: finalQuoteId,
          details: {
            jobID: finalQuoteId,
            ...quoteForm
          },
          items: [...activeQuoteItems],
          subtotal
        };

        setFinalizedQuotes(prev => {
          const filtered = prev.filter(q => q.id !== editingQuoteId && q.id !== finalQuoteId);
          return [...filtered, updatedQuote];
        });

        const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
          jobID: finalQuoteId,
          clientName: quoteForm.clientName,
          qty: item.qty,
          desc: item.desc,
          unitPrice: item.unitPrice,
          total: item.total
        }));

        setJobBook(prev => {
          const filtered = prev.filter(e => e.jobID !== editingQuoteId && e.jobID !== finalQuoteId);
          return [...filtered, ...newEntries];
        });

        setSheetDoc({
          type: 'QUOTE',
          details: {
            ...quoteForm,
            jobID: finalQuoteId
          },
          items: [...activeQuoteItems]
        });

        setSelectedQuoteId(finalQuoteId);
        setEditingQuoteId(null);
        setEditedQuoteId("");
        alert(`Quotation Reference: ${finalQuoteId} has been successfully updated, logged to Job Book, and prepared for PDF download.`);
      } else {
        // Mode: Fresh draft or quick print of an already saved quote.
        const currentID = sheetDoc.details.jobID;
        const existsInLogs = finalizedQuotes.some(q => q.id === currentID && currentID !== "DRAFT" && currentID !== "01MAS26");

        if (existsInLogs) {
          // Already saved, let's update it in-place to make sure any modifications are synchronized
          const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
          const updatedQuote = {
            id: currentID,
            details: {
              jobID: currentID,
              ...quoteForm
            },
            items: [...activeQuoteItems],
            subtotal
          };

          setFinalizedQuotes(prev => prev.map(q => q.id === currentID ? updatedQuote : q));

          const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
            jobID: currentID,
            clientName: quoteForm.clientName,
            qty: item.qty,
            desc: item.desc,
            unitPrice: item.unitPrice,
            total: item.total
          }));

          setJobBook(prev => {
            const filtered = prev.filter(e => e.jobID !== currentID);
            return [...filtered, ...newEntries];
          });

          alert(`Changes to saved Quotation ${currentID} have been auto-saved and logged before PDF download.`);
        } else {
          // Fresh draft needs a new unique ID and a complete log entry 
          const generatedID = generateJobID(quoteForm.clientName);
          
          const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
            jobID: generatedID,
            clientName: quoteForm.clientName,
            qty: item.qty,
            desc: item.desc,
            unitPrice: item.unitPrice,
            total: item.total
          }));

          setJobBook(prev => [...prev, ...newEntries]);

          const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
          const newFinalized = {
            id: generatedID,
            details: {
              jobID: generatedID,
              ...quoteForm
            },
            items: [...activeQuoteItems],
            subtotal
          };

          setFinalizedQuotes(prev => {
            const filtered = prev.filter(q => q.id !== generatedID);
            return [...filtered, newFinalized];
          });

          setSelectedQuoteId(generatedID);

          setSheetDoc({
            type: 'QUOTE',
            details: {
              ...quoteForm,
              jobID: generatedID
            },
            items: [...activeQuoteItems]
          });

          alert(`Quotation auto-saved and logged to Job Book under Reference: ${generatedID} before PDF download.`);
        }
      }
    }

    if (!sheetRef.current) return;
    
    setIsGeneratingPDF(true);
    
    // Helper function to sanitize any OKLCH/OKLAB colors into standard RGB format for html2canvas compatibility
    const convertModernColorsToRgb = (cssTextString: string) => {
      const toSRGB = (x: number) => {
        return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      };

      const convertToRgbString = (L: number, a_lab: number, b_lab: number, a: number | undefined) => {
        const l_lms = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
        const m_lms = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
        const s_lms = L - 0.0894841775 * a_lab - 1.2914855480 * b_lab;
        
        const l_cube = l_lms < 0 ? 0 : l_lms * l_lms * l_lms;
        const m_cube = m_lms < 0 ? 0 : m_lms * m_lms * m_lms;
        const s_cube = s_lms < 0 ? 0 : s_lms * s_lms * s_lms;
        
        const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
        const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
        const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;
        
        const r = Math.max(0, Math.min(255, Math.round(toSRGB(r_lin) * 255)));
        const g = Math.max(0, Math.min(255, Math.round(toSRGB(g_lin) * 255)));
        const b = Math.max(0, Math.min(255, Math.round(toSRGB(b_lin) * 255)));
        
        if (a !== undefined) {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      };

      // 1. Process OKLCH using a super robust fallback regex
      let result = cssTextString.replace(/oklch\(([^)]+)\)/g, (match, inner) => {
        try {
          const parts = inner.trim().split(/[\s/]+/);
          if (parts.length >= 3) {
            let lPart = parts[0];
            let cPart = parts[1];
            let hPart = parts[2];
            let aPart = parts[3];

            let l = parseFloat(lPart);
            if (lPart.endsWith('%')) l = l / 100;
            const c = parseFloat(cPart);
            const h = parseFloat(hPart);
            
            let a = undefined;
            if (aPart) {
              a = parseFloat(aPart);
              if (aPart.endsWith('%')) a = a / 100;
            }

            if (!isNaN(l) && !isNaN(c) && !isNaN(h)) {
              const hRad = (h * Math.PI) / 180;
              const a_lab = c * Math.cos(hRad);
              const b_lab = c * Math.sin(hRad);
              return convertToRgbString(l, a_lab, b_lab, a);
            }
          }
          return 'rgb(100, 116, 139)'; // Slate fallback for unparseable complex dynamic values
        } catch (e) {
          return 'rgb(100, 116, 139)';
        }
      });

      // 2. Process OKLAB using a super robust fallback regex
      result = result.replace(/oklab\(([^)]+)\)/g, (match, inner) => {
        try {
          const parts = inner.trim().split(/[\s/]+/);
          if (parts.length >= 3) {
            let lPart = parts[0];
            let aPart = parts[1];
            let bPart = parts[2];
            let alphaPart = parts[3];

            let l = parseFloat(lPart);
            if (lPart.endsWith('%')) l = l / 100;
            const a_lab = parseFloat(aPart);
            const b_lab = parseFloat(bPart);
            
            let alpha = undefined;
            if (alphaPart) {
              alpha = parseFloat(alphaPart);
              if (alphaPart.endsWith('%')) alpha = alpha / 100;
            }

            if (!isNaN(l) && !isNaN(a_lab) && !isNaN(b_lab)) {
              return convertToRgbString(l, a_lab, b_lab, alpha);
            }
          }
          return 'rgb(100, 116, 139)'; // Slate fallback for unparseable complex dynamic values
        } catch (e) {
          return 'rgb(100, 116, 139)';
        }
      });

      return result;
    };

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function(elt, pseudoElt) {
      const style = originalGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const value = target.getPropertyValue(propertyName);
              if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
                return convertModernColorsToRgb(value);
              }
              return value;
            };
          }
          const value = target[prop as any];
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
            return convertModernColorsToRgb(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };

    const originalStyleContents = new Map<HTMLStyleElement, string>();
    const tempInlineStyles: HTMLStyleElement[] = [];
    const disabledLinks: HTMLLinkElement[] = [];

    try {
      // 1. Convert any oklch/oklab color references in existing style tags
      const styleTags = Array.from(document.getElementsByTagName('style'));
      for (const tag of styleTags) {
        if (tag.innerHTML && (tag.innerHTML.includes('oklch') || tag.innerHTML.includes('oklab'))) {
          originalStyleContents.set(tag, tag.innerHTML);
          tag.innerHTML = convertModernColorsToRgb(tag.innerHTML);
        }
      }

      // 2. Fetch and inline any linked stylesheets that might contain oklch/oklab definitions
      const linkTags = Array.from(document.getElementsByTagName('link')) as HTMLLinkElement[];
      for (const link of linkTags) {
        if (link.rel === 'stylesheet' && link.href) {
          if (link.href.startsWith(window.location.origin) || !link.href.startsWith('http')) {
            try {
              const response = await fetch(link.href);
              if (response.ok) {
                let cssText = await response.text();
                if (cssText.includes('oklch') || cssText.includes('oklab')) {
                  cssText = convertModernColorsToRgb(cssText);
                  const tempStyle = document.createElement('style');
                  tempStyle.setAttribute('data-temp-sanitized-style', 'true');
                  tempStyle.innerHTML = cssText;
                  document.head.appendChild(tempStyle);
                  tempInlineStyles.push(tempStyle);
                  
                  link.disabled = true;
                  disabledLinks.push(link);
                }
              }
            } catch (err) {
              console.warn("Failed to fetch/inline stylesheet for PDF generation:", link.href, err);
            }
          }
        }
      }

      // Small delay to ensure styles propagate and UI transitions complete
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const element = sheetRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2.2, // high quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY, // prevent scroll clipping on mobile Android
        onclone: (clonedDoc) => {
          // Override getComputedStyle for the cloned window context
          const clonedWindow = clonedDoc.defaultView;
          if (clonedWindow) {
            const originalClonedGetComputedStyle = clonedWindow.getComputedStyle;
            clonedWindow.getComputedStyle = function(elt, pseudoElt) {
              const style = originalClonedGetComputedStyle.call(clonedWindow, elt, pseudoElt);
              return new Proxy(style, {
                get(target, prop, receiver) {
                  if (prop === 'getPropertyValue') {
                    return function(propertyName: string) {
                      const value = target.getPropertyValue(propertyName);
                      if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
                        return convertModernColorsToRgb(value);
                      }
                      return value;
                    };
                  }
                  const value = target[prop as any];
                  if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
                    return convertModernColorsToRgb(value);
                  }
                  if (typeof value === 'function') {
                    return value.bind(target);
                  }
                  return value;
                }
              });
            };
          }

          // Also double-check all styles and element inline styles in cloned DOM
          const clonedStyles = Array.from(clonedDoc.getElementsByTagName('style'));
          for (const styleTag of clonedStyles) {
            if (styleTag.innerHTML && (styleTag.innerHTML.includes('oklch') || styleTag.innerHTML.includes('oklab'))) {
              styleTag.innerHTML = convertModernColorsToRgb(styleTag.innerHTML);
            }
          }

          const allEl = Array.from(clonedDoc.getElementsByTagName('*')) as HTMLElement[];
          for (const el of allEl) {
            if (el.style) {
              const cssText = el.style.cssText;
              if (cssText && (cssText.includes('oklch') || cssText.includes('oklab'))) {
                el.style.cssText = convertModernColorsToRgb(cssText);
              }
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
      
      pdf.addImage(imgData, 'PNG', 0, yOffset > 0 ? yOffset : 0, imgWidth, imgHeight);
      
      const cleanClient = (sheetDoc.details.clientName || 'CLIENT')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .toUpperCase();
      const docId = (sheetDoc.details.jobID || 'DOCUMENT').trim().replace(/\s+/g, '_').toUpperCase();
      const docType = (sheetDoc.type || 'DOCUMENT').trim().toUpperCase();
      
      pdf.save(`${docId}_${cleanClient}_${docType}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try the standard 'Print' option.");
    } finally {
      // Restore original getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore original stylesheets and remove temp styles
      originalStyleContents.forEach((content, tag) => {
        tag.innerHTML = content;
      });
      tempInlineStyles.forEach(tag => {
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      });
      disabledLinks.forEach(link => {
        link.disabled = false;
      });
      setIsGeneratingPDF(false);
    }
  };

  // Format utility matching standard Excel accounting
  const formatCurrency = (val: number) => {
    return `${activeCurrency}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Generate Unique Job ID like VBA: format(clientCount, "00") & clientCode & "26"
  const generateJobID = (clientName: string) => {
    const formattedClient = (clientName || "CLT")
      .replace(/\s+/g, '')
      .toUpperCase();
    const clientCode = formattedClient.length >= 3 ? formattedClient.substring(0, 3) : formattedClient.padEnd(3, 'X');
    
    // Count matches in Job Book
    const matchesCount = jobBook.filter(entry => entry.clientName.toLowerCase() === clientName.toLowerCase()).length;
    // For visual simulation, let's also query finalizedQuotes
    const existingQuotesCount = finalizedQuotes.filter(q => q.details.clientName.toLowerCase() === clientName.toLowerCase()).length;
    const clientCount = Math.max(matchesCount, existingQuotesCount) + 1;
    
    const countStr = String(clientCount).padStart(2, '0');
    return `${countStr}${clientCode}26`;
  };

  // Trigger: Refresh Sheet Preview with Quotation Form values
  const handleUpdateQuotePreview = () => {
    const jobID = editingQuoteId ? (editedQuoteId.trim() || editingQuoteId) : generateJobID(quoteForm.clientName);
    setSheetDoc({
      type: 'QUOTE',
      details: {
        ...quoteForm,
        jobID
      },
      items: [...activeQuoteItems]
    });
  };

  // Trigger: Save Quotation as PDF? (Log to Job Book, push to Finalized list)
  const handleSaveQuotation = () => {
    if (activeQuoteItems.length === 0) {
      alert("Please add at least one item before saving the quotation.");
      return;
    }
    const generatedID = generateJobID(quoteForm.clientName);
    
    // 1. Logger to state representing wsJob ("Job_Book" Excel Sheet)
    const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
      jobID: generatedID,
      clientName: quoteForm.clientName,
      qty: item.qty,
      desc: item.desc,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    setJobBook(prev => [...prev, ...newEntries]);

    // 2. Add to finalized list for later Invoice conversion
    const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
    const newFinalized = {
      id: generatedID,
      details: {
        jobID: generatedID,
        ...quoteForm
      },
      items: [...activeQuoteItems],
      subtotal
    };

    setFinalizedQuotes(prev => {
      // replace if exists, otherwise append
      const filtered = prev.filter(q => q.id !== generatedID);
      return [...filtered, newFinalized];
    });

    setSelectedQuoteId(generatedID);

    // 3. Update WYSIWYG
    setSheetDoc({
      type: 'QUOTE',
      details: {
        ...quoteForm,
        jobID: generatedID
      },
      items: [...activeQuoteItems]
    });

    // Alert with success confirmation
    alert(`Quotation saved and logged to Job Book successfully under Reference: ${generatedID}`);
  };

  // Load a saved quotation for review and editing
  const handleLoadQuoteForEdit = (quoteId: string) => {
    const quote = finalizedQuotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    setEditingQuoteId(quote.id);
    setEditedQuoteId(quote.id);
    setQuoteForm({
      clientName: quote.details.clientName,
      addr: quote.details.addr,
      city: quote.details.city,
      contact: quote.details.contact,
      repName: quote.details.repName,
      date: quote.details.date,
      workStatus: quote.details.workStatus || "None",
      downPayment: quote.details.downPayment || 0
    });
    setActiveQuoteItems([...quote.items]);
    
    // Update the live preview sheet to show this quote immediately.
    setSheetDoc({
      type: 'QUOTE',
      details: {
        ...quote.details
      },
      items: [...quote.items]
    });
  };

  // Cancel reviewing/editing a saved quotation and restore to default empty/blank list
  const handleCancelQuoteEdit = () => {
    setEditingQuoteId(null);
    setEditedQuoteId("");
    setQuoteForm({
      clientName: "",
      addr: "",
      city: "",
      contact: "",
      repName: "",
      date: new Date().toISOString().split('T')[0],
      workStatus: "None",
      downPayment: 0
    });
    setActiveQuoteItems([]);
    
    // Reset sheet doc back to empty/draft
    setSheetDoc({
      type: 'QUOTE',
      details: {
        jobID: "DRAFT",
        clientName: "",
        addr: "",
        city: "",
        contact: "",
        repName: "",
        date: new Date().toISOString().split('T')[0],
        workStatus: "None",
        downPayment: 0
      },
      items: []
    });
  };

  // States and helpers for client lookup from job ledger
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const uniqueLedgerClients = Array.from(
    new Set([
      ...finalizedQuotes.map(q => q.details.clientName),
      ...jobBook.map(j => j.clientName)
    ].filter((name): name is string => typeof name === 'string' && name.trim() !== ""))
  );

  const getFieldOptions = (fieldName: 'addr' | 'city' | 'contact' | 'repName'): string[] => {
    const currentClient = quoteForm.clientName.trim().toLowerCase();
    if (!currentClient) return [];
    
    const matches = finalizedQuotes.filter(
      q => q.details.clientName.trim().toLowerCase() === currentClient
    );
    
    const values = matches
      .map(q => q.details[fieldName])
      .filter((v): v is string => typeof v === 'string' && v.trim() !== "");
      
    const uniqueMap = new Map<string, string>();
    values.forEach(v => {
      const key = v.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, v.trim());
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  const handleSelectClientFromLedger = (selectedName: string) => {
    const matches = finalizedQuotes.filter(
      q => q.details.clientName.trim().toLowerCase() === selectedName.trim().toLowerCase()
    );
    
    if (matches.length > 0) {
      const uniqueAddrs = Array.from(new Set(matches.map(m => m.details.addr).filter(Boolean)));
      const uniqueCities = Array.from(new Set(matches.map(m => m.details.city).filter(Boolean)));
      const uniqueContacts = Array.from(new Set(matches.map(m => m.details.contact).filter(Boolean)));
      const uniqueReps = Array.from(new Set(matches.map(m => m.details.repName).filter(Boolean)));
      
      setQuoteForm(prev => ({
        ...prev,
        clientName: selectedName,
        addr: uniqueAddrs.length === 1 ? uniqueAddrs[0] : prev.addr,
        city: uniqueCities.length === 1 ? uniqueCities[0] : prev.city,
        contact: uniqueContacts.length === 1 ? uniqueContacts[0] : prev.contact,
        repName: uniqueReps.length === 1 ? uniqueReps[0] : prev.repName,
      }));
    } else {
      setQuoteForm(prev => ({ ...prev, clientName: selectedName }));
    }
    
    // Update active template preview
    setTimeout(() => {
      handleUpdateQuotePreview();
    }, 50);
  };

  // Clear all invoice/quotation inputs, active line items, and comments to start a completely new document
  const handleClearInvoiceAndComments = () => {
    const confirmClear = window.confirm("Are you sure you want to clear all current active quotation/invoice entries, customer metadata, active line items, and comments? This allows starting a brand new document.");
    if (!confirmClear) return;

    setEditingQuoteId(null);
    setEditedQuoteId("");
    setQuoteForm({
      clientName: "",
      addr: "",
      city: "",
      contact: "",
      repName: "",
      date: new Date().toISOString().split('T')[0],
      workStatus: "None",
      downPayment: 0
    });
    setActiveQuoteItems([]);
    setQuoteComments([
      "Kindly permit us to use your logo and completed works for advertising and social media promotional purposes."
    ]);
    setInvoiceOrderNum("");
    setSelectedQuoteId("__ACTIVE_DRAFT__");
    
    // Reset sheet doc back to empty/draft in QUOTE mode by default
    setSheetDoc({
      type: 'QUOTE',
      details: {
        jobID: "DRAFT",
        clientName: "",
        addr: "",
        city: "",
        contact: "",
        repName: "",
        date: new Date().toISOString().split('T')[0],
        workStatus: "None",
        downPayment: 0
      },
      items: []
    });
  };

  // Re-save/Update an existing logged quotation and synchronize across all logs/job book
  const handleUpdateSavedQuotation = () => {
    if (!editingQuoteId) return;
    if (activeQuoteItems.length === 0) {
      alert("Please add at least one item before updating the quotation.");
      return;
    }

    const finalQuoteId = editedQuoteId.trim() || editingQuoteId;

    const subtotal = activeQuoteItems.reduce((acc, item) => acc + item.total, 0);
    const updatedQuote = {
      id: finalQuoteId,
      details: {
        jobID: finalQuoteId,
        ...quoteForm
      },
      items: [...activeQuoteItems],
      subtotal
    };

    // 1. Update Finalized Quotes
    setFinalizedQuotes(prev => {
      const filtered = prev.filter(q => q.id !== editingQuoteId && q.id !== finalQuoteId);
      return [...filtered, updatedQuote];
    });

    // 2. Update Job Book records (replace old entries with new ones)
    const newEntries: JobBookEntry[] = activeQuoteItems.map(item => ({
      jobID: finalQuoteId,
      clientName: quoteForm.clientName,
      qty: item.qty,
      desc: item.desc,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    setJobBook(prev => {
      const filtered = prev.filter(e => e.jobID !== editingQuoteId && e.jobID !== finalQuoteId);
      return [...filtered, ...newEntries];
    });

    // 3. Update the WYSIWYG sheet preview
    setSheetDoc({
      type: 'QUOTE',
      details: {
        ...quoteForm,
        jobID: finalQuoteId
      },
      items: [...activeQuoteItems]
    });

    // 4. Update selected quote in invoice dropdown so it works seamlessly
    setSelectedQuoteId(finalQuoteId);

    // 5. Success alert
    alert(`Quotation Reference: ${finalQuoteId} has been successfully updated! Generating an invoice from this quotation ID will now reflect all these changes.`);
    
    // 6. Clear editing mode
    setEditingQuoteId(null);
    setEditedQuoteId("");
  };

  // Add Item to Quotation Active Draft
  const handleAddLineItem = () => {
    if (!newItemDesc) {
      alert("Please enter a description for the item.");
      return;
    }
    const newItem: LineItem = {
      id: Date.now().toString(),
      qty: newItemQty,
      desc: newItemDesc,
      unitPrice: newItemPrice,
      total: newItemQty * newItemPrice
    };
    setActiveQuoteItems(prev => [...prev, newItem]);
    
    // Clear item inputs helper
    setNewItemDesc("");
    setNewItemPrice(0);
    setNewItemQty(1);
    
    // Hot-update the Sheet view
    const generatedID = editingQuoteId || generateJobID(quoteForm.clientName);
    setSheetDoc(prev => {
      if (prev.type === 'QUOTE') {
        return {
          ...prev,
          details: { ...prev.details, jobID: generatedID },
          items: [...prev.items, newItem]
        };
      }
      return prev;
    });
  };

  // Remove line item
  const handleRemoveLineItem = (id: string) => {
    setActiveQuoteItems(prev => prev.filter(item => item.id !== id));
    setSheetDoc(prev => {
      if (prev.type === 'QUOTE') {
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        };
      }
      return prev;
    });
  };

  // Cancel editing line item inline
  const handleCancelEditLineItem = () => {
    setEditingLineItemId(null);
    setEditingLineItemDesc("");
    setEditingLineItemQty(1);
    setEditingLineItemPrice(0);
  };

  // Start editing line item
  const handleStartEditLineItem = (item: LineItem) => {
    setEditingLineItemId(item.id);
    setEditingLineItemDesc(item.desc);
    setEditingLineItemQty(item.qty);
    setEditingLineItemPrice(item.unitPrice);
  };

  // Save the edited line item
  const handleSaveLineItemEdit = (id: string) => {
    if (!editingLineItemDesc.trim()) {
      alert("Please enter a description for the item.");
      return;
    }
    
    setActiveQuoteItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          qty: editingLineItemQty,
          desc: editingLineItemDesc.trim(),
          unitPrice: editingLineItemPrice,
          total: editingLineItemQty * editingLineItemPrice
        };
      }
      return item;
    }));

    // Update sheet preview if it's active
    setSheetDoc(prev => {
      if (prev.type === 'QUOTE') {
        return {
          ...prev,
          items: prev.items.map(item => {
            if (item.id === id) {
              return {
                ...item,
                qty: editingLineItemQty,
                desc: editingLineItemDesc.trim(),
                unitPrice: editingLineItemPrice,
                total: editingLineItemQty * editingLineItemPrice
              };
            }
            return item;
          })
        };
      }
      return prev;
    });

    handleCancelEditLineItem();
  };

  // Cancel editing comment item
  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setEditingCommentText("");
  };

  // Save edited comment item
  const handleSaveCommentEdit = (index: number) => {
    if (!editingCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    setQuoteComments(prev => {
      const copy = [...prev];
      copy[index] = editingCommentText.trim();
      return copy;
    });
    handleCancelEditComment();
  };

  // Finalize Invoice Action (Stage 1-6 from VBA)
  const handleFinalizeInvoice = () => {
    let parentDetails: DocumentDetails;
    let parentItems: LineItem[];

    if (selectedQuoteId === '__ACTIVE_DRAFT__') {
      const generatedID = generateJobID(quoteForm.clientName);
      parentDetails = {
        jobID: generatedID,
        ...quoteForm
      };
      parentItems = [...activeQuoteItems];
    } else {
      const parentQuote = finalizedQuotes.find(q => q.id === selectedQuoteId);
      if (!parentQuote) {
        alert("Please select a valid Quote ID.");
        return;
      }
      parentDetails = { ...parentQuote.details };
      parentItems = [...parentQuote.items];
    }

    // Set Sheet state representing the populated Invoice sheet
    setSheetDoc({
      type: 'INVOICE',
      details: {
        ...parentDetails,
        orderNum: invoiceOrderNum,
        date: invoiceDate
      },
      items: parentItems
    });

    setActiveTab('invoice');

    // Trigger system OS print dialogue
    setTimeout(() => {
      handlePrintDocument();
    }, 350);
  };

  // Quick helper to auto-populate form for demo purposes
  const loadDemoQuote = (quote: typeof finalizedQuotes[0]) => {
    setQuoteForm({
      clientName: quote.details.clientName,
      addr: quote.details.addr,
      city: quote.details.city,
      contact: quote.details.contact,
      repName: quote.details.repName,
      date: quote.details.date
    });
    setActiveQuoteItems([...quote.items]);
    setSheetDoc({
      type: 'QUOTE',
      details: { ...quote.details },
      items: [...quote.items]
    });
    setActiveTab('quote');
  };

  // Calculated variables for active sheet rendered
  const currentQuoteSubtotal = sheetDoc.items.reduce((sum, item) => sum + item.total, 0);
  
  // Note: Standard sheet ranges from row 15 to row 29.
  // When converted to Invoice, wsQuote items are copied from index 15 to J[lastRow].
  // Then floating SUBTOTAL line is printed immediately below the last row.
  // In our preview, we display the line items followed by a SUBTOTAL row,
  // matching the floating arrangement.
  // In Stage 4, the grand total double counting math calculates total: sum(J15:J29) / 2.
  // Let us mathematically match what Excel does to show accurate alignment!
  const mockTableData: (LineItem | { type: 'subtotal'; val: number })[] = [
    ...sheetDoc.items,
    { type: 'subtotal', val: currentQuoteSubtotal }
  ];

  // Sum of cells J15 to J29 would include items + subtotal.
  // Thus, sum is currentQuoteSubtotal (from items) + currentQuoteSubtotal (from subtotal indicator) = 2 * currentQuoteSubtotal
  // Grand total formula in Excel: =SUM(J15:J29)/2
  // Let's prove we represent this Excel sum logic on screen:
  const doubleSumOfRange = currentQuoteSubtotal + currentQuoteSubtotal; 
  const grandTotalResult = doubleSumOfRange / 2;

  // Progressive Single-Page layout adaptive spacing parameters
  const isInvoice = sheetDoc.type !== 'QUOTE';
  const itemsCount = sheetDoc.items.length;
  const promoCommentText = "Kindly permit us to use your logo and completed works for advertising and social media promotional purposes.";
  const displayComments = quoteComments.some(c => c.toLowerCase().includes("kindly permit us to use your logo"))
    ? quoteComments
    : [promoCommentText, ...quoteComments];
  const commentsCount = displayComments.length;
  
  // Each comment is roughly equivalent to 0.75 of an item row in terms of vertical footprint on the printout.
  const effectiveItemsCount = itemsCount + (isInvoice ? 0 : commentsCount * 0.75);

  const isCrowded = effectiveItemsCount > 6 || (isInvoice && itemsCount > 4);
  const isVeryCrowded = effectiveItemsCount > 10 || (isInvoice && itemsCount > 7);
  const isUltraCrowded = effectiveItemsCount > 13 || (isInvoice && itemsCount > 10);
  
  // Total target rows to render to perfectly fill exactly one page:
  // Since Invoice view includes a larger and detailed accounting footer, we use a smaller rows ceiling (6) so it never spills over.
  const targetTotalRows = isInvoice 
    ? Math.max(6, itemsCount) 
    : Math.max(12, itemsCount);

  // Row and text sizing adaptivity
  const rowPaddingClass = isUltraCrowded 
    ? 'py-0.5' 
    : isVeryCrowded 
      ? 'py-1' 
      : isCrowded 
        ? 'py-2' 
        : 'py-3';

  const rowFontSizeClass = isUltraCrowded 
    ? 'text-[10px]' 
    : isVeryCrowded 
      ? 'text-[10.5px]' 
      : isCrowded 
        ? 'text-[11px]' 
        : 'text-[11px]';

  // Branding component sizes
  const logoMaxHeightStyle = isUltraCrowded ? '26px' : isVeryCrowded ? '32px' : isCrowded ? '42px' : '52px';
  const headerAddressFontSizeClass = isUltraCrowded ? 'text-[8.5px] leading-[11px]' : isVeryCrowded ? 'text-[9px] leading-[12px]' : isCrowded ? 'text-[9.5px] leading-[13px]' : 'text-[10.5px] leading-[14px]';
  const bannerHeightClass = isUltraCrowded ? 'h-[20px] mt-0.5 mb-1' : isVeryCrowded ? 'h-[24px] mt-1 mb-1.5' : isCrowded ? 'h-[30px] mt-1.5 mb-2.5' : 'h-[38px] mt-2 mb-3.5';
  const bannerFontSizeClass = isUltraCrowded ? 'text-[11px]' : isVeryCrowded ? 'text-[12.5px]' : isCrowded ? 'text-[14.5px]' : 'text-[16.5px]';
  const billingBlockMarginClass = isUltraCrowded ? 'mt-1 gap-2' : isVeryCrowded ? 'mt-1.5 gap-3' : isCrowded ? 'mt-2 gap-4' : 'mt-3 gap-6';
  
  // Footer parts spacers/margins
  const footerMtClass = isUltraCrowded ? 'mt-1' : isVeryCrowded ? 'mt-2' : isCrowded ? 'mt-4' : 'mt-6';
  const invoiceFooterSpacingGapClass = isUltraCrowded ? 'gap-1' : isVeryCrowded ? 'gap-2' : isCrowded ? 'gap-4' : 'gap-6';
  const commentSpacerHeightClass = isUltraCrowded ? 'h-1' : isVeryCrowded ? 'h-2' : isCrowded ? 'h-3' : 'h-4';
  const thankYouMarginClass = isUltraCrowded 
    ? 'mt-1.5 mb-1' 
    : isVeryCrowded 
      ? 'mt-3 mb-1.5' 
      : isCrowded 
        ? 'mt-6 mb-2.5' 
        : 'mt-12 mb-4';
  const bankDetailsPaddingClass = isUltraCrowded
    ? 'p-1 mt-1.5'
    : isVeryCrowded 
      ? 'p-1.5 mt-3' 
      : isCrowded 
        ? 'p-2.5 mt-5' 
        : 'p-3.5 mt-6';
  const pageBorderLineMtClass = isUltraCrowded
    ? 'mt-1.5 mb-1'
    : isVeryCrowded 
      ? 'mt-3 mb-1.5' 
      : isCrowded 
        ? 'mt-6 mb-2.5' 
        : 'mt-8 mb-3';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* Upper Navigation & Global Workspace Header */}
      <header id="hdr-main" className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              Quotation & Invoice Studio <span className="text-xs bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">Interactive Preview</span>
            </h1>
            <p className="text-xs text-slate-400">Perfect Excel-Aligned PDF Generation System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800 gap-1.5">
            <button 
              id="btn-tab-quote"
              onClick={() => {
                setActiveTab('quote');
                const generatedID = generateJobID(quoteForm.clientName);
                setSheetDoc({
                  type: 'QUOTE',
                  details: {
                    ...quoteForm,
                    jobID: generatedID
                  },
                  items: [...activeQuoteItems]
                });
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border ${activeTab === 'quote' ? 'bg-teal-950/40 text-teal-350 border-teal-500/30 shadow-md shadow-teal-950/30 font-bold' : 'text-slate-400 hover:text-white border-transparent'}`}
            >
              <FileText className="h-3.5 w-3.5 text-teal-400" />
              1. Create Quote
            </button>
             <button 
              id="btn-tab-invoice"
              onClick={() => {
                setActiveTab('invoice');
                let parentDetails: DocumentDetails;
                let parentItems: LineItem[];

                if (selectedQuoteId === '__ACTIVE_DRAFT__') {
                  const generatedID = generateJobID(quoteForm.clientName);
                  parentDetails = {
                    jobID: generatedID,
                    ...quoteForm
                  };
                  parentItems = [...activeQuoteItems];
                } else {
                  const parentQuote = finalizedQuotes.find(q => q.id === selectedQuoteId);
                  if (parentQuote) {
                    parentDetails = { ...parentQuote.details };
                    parentItems = [...parentQuote.items];
                  } else {
                    return;
                  }
                }

                setSheetDoc({
                  type: 'INVOICE',
                  details: {
                    ...parentDetails,
                    orderNum: invoiceOrderNum,
                    date: invoiceDate
                  },
                  items: parentItems
                });
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border ${activeTab === 'invoice' ? 'bg-purple-950/40 text-purple-350 border-purple-500/30 shadow-md shadow-purple-950/30 font-bold' : 'text-slate-400 hover:text-white border-transparent'}`}
            >
              <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
              2. Finalize Invoice
            </button>
            <button 
              id="btn-tab-ledger"
              onClick={() => setActiveTab('job_book')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border ${activeTab === 'job_book' ? 'bg-emerald-950/40 text-emerald-350 border-emerald-500/30 shadow-md shadow-emerald-950/30 font-bold' : 'text-slate-400 hover:text-white border-transparent'}`}
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              Job Ledger
            </button>
            <button 
              id="btn-tab-docs"
              onClick={() => {
                setActiveTab('design_docs');
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 border ${activeTab === 'design_docs' ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 shadow-md shadow-cyan-950/30 font-bold' : 'text-teal-450 hover:text-teal-300 border-transparent'}`}
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              Co-Design & QA
            </button>
          </div>

          <div className="flex bg-slate-950 rounded-lg px-2.5 py-1 items-center border border-slate-800 text-xs text-slate-400 gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">Currency:</span>
            <select 
              value={activeCurrency} 
              onChange={(e) => setActiveCurrency(e.target.value)}
              className="bg-slate-900 border border-slate-700/60 text-teal-400 focus:border-teal-500 focus:outline-none text-xs font-mono font-bold rounded px-2 py-0.5 cursor-pointer min-w-[70px] transition-all text-center"
            >
              <option value="$">$ USD</option>
              <option value="£">£ GBP</option>
              <option value="€">€ EUR</option>
              <option value="R">R ZAR</option>
              <option value="¥">¥ JPY</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Control Panel (Forms & Ledger UI) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          
          <AnimatePresence mode="wait">
            
            {activeTab === 'quote' && (
              <motion.div 
                key="quote-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-center bg-teal-500/10 text-teal-400 text-xs px-3 py-1 rounded-lg font-mono mb-2 border border-teal-500/10 self-start">
                    EXCEL WORKSHEET: QUOTE_TEMPLATE
                  </div>
                  <h2 className="text-md font-bold text-white flex items-center gap-2">
                    Quotation Header & Line Items
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">This populates Customer Details, Rep name, and dynamic item rows in the template.</p>
                </div>

                {/* Review & Edit Quotation Selector */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-teal-400" />
                      Review & Edit Saved Quotations
                    </span>
                    {editingQuoteId && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                        EDITING: {editingQuoteId}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={editingQuoteId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleLoadQuoteForEdit(val);
                        } else {
                          handleCancelQuoteEdit();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Choose Quote to Review/Edit --</option>
                      {finalizedQuotes.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.id} - {q.details.clientName} ({formatCurrency(q.subtotal)})
                        </option>
                      ))}
                    </select>
                    {editingQuoteId && (
                      <button
                        type="button"
                        onClick={handleCancelQuoteEdit}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700"
                      >
                        Reset / New
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Select any logged quotation above to review its data, make edits, and re-save. Corresponding invoices will automatically reflect your changes.
                  </p>
                </div>

                {/* Form Elements */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {editingQuoteId && (
                    <div className="flex flex-col gap-1.5 col-span-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                      <label className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Modify Quotation Number
                      </label>
                      <input 
                        type="text" 
                        value={editedQuoteId}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setEditedQuoteId(val);
                          // Live update preview!
                          setSheetDoc(prev => {
                            if (prev.type === 'QUOTE') {
                              return {
                                ...prev,
                                details: {
                                  ...prev.details,
                                  jobID: val
                                }
                              };
                            }
                            return prev;
                          });
                        }}
                        placeholder="e.g. 01MAS26"
                        className="bg-slate-950 border border-amber-500/30 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono text-xs font-semibold"
                      />
                      <span className="text-[9px] text-slate-500 italic">
                        Changing this will rename this quotation across the finalized list and its ledger row entries.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 col-span-2 relative">
                    <label className="text-slate-400 font-medium">Customer Name (writes to B9)</label>
                    <input 
                      type="text" 
                      value={quoteForm.clientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuoteForm(prev => ({ ...prev, clientName: val }));
                        setShowClientSuggestions(true);
                      }}
                      onFocus={() => setShowClientSuggestions(true)}
                      onBlur={() => {
                        // Small delay to allow clicking suggestions
                        setTimeout(() => setShowClientSuggestions(false), 200);
                        setTimeout(handleUpdateQuotePreview, 50);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium animate-pulse-once"
                    />
                    {showClientSuggestions && (() => {
                      const currentInput = quoteForm.clientName.trim().toLowerCase();
                      const matchingClients = currentInput
                        ? uniqueLedgerClients.filter(name => 
                            name.toLowerCase().startsWith(currentInput) && 
                            name.toLowerCase() !== currentInput
                          )
                        : uniqueLedgerClients;
                        
                      if (matchingClients.length > 0) {
                        return (
                          <div 
                            className="absolute z-50 left-0 right-0 top-[100%] mt-1 border border-slate-750 rounded-lg shadow-2xl max-h-52 overflow-y-auto"
                            style={{ backgroundColor: '#0f172a', opacity: 1 }}
                          >
                            <div 
                              className="px-3 py-1.5 text-[9px] font-extrabold border-b border-slate-800 tracking-wider sticky top-0"
                              style={{ backgroundColor: '#090d16', color: '#94a3b8' }}
                            >
                              SELECT CUSTOMER FROM LEDGER
                            </div>
                            {matchingClients.map((client, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => {
                                  handleSelectClientFromLedger(client);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors border-b border-slate-800/80 last:border-0 font-medium cursor-pointer"
                                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                              >
                                {client}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-slate-400 font-medium">Customer Address (writes to B10)</label>
                    <input 
                      type="text" 
                      value={quoteForm.addr}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, addr: e.target.value }))}
                      onBlur={handleUpdateQuotePreview}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                    {(() => {
                      const opts = getFieldOptions('addr');
                      if (opts.length > 1) {
                        return (
                          <div className="mt-1 flex flex-wrap gap-1 items-center p-1.5 rounded border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mr-1" style={{ color: '#2dd4bf' }}>Choose Address:</span>
                            {opts.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setQuoteForm(prev => ({ ...prev, addr: opt }));
                                  setTimeout(handleUpdateQuotePreview, 50);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                                  quoteForm.addr === opt 
                                    ? 'border-teal-500/40 font-semibold' 
                                    : 'border-slate-800 hover:border-slate-700'
                                }`}
                                style={{
                                  color: quoteForm.addr === opt ? '#5eead4' : '#cbd5e1',
                                  backgroundColor: quoteForm.addr === opt ? 'rgba(20, 184, 166, 0.2)' : '#0f172a'
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Customer City (writes to B11)</label>
                    <input 
                      type="text" 
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, city: e.target.value }))}
                      onBlur={handleUpdateQuotePreview}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                    {(() => {
                      const opts = getFieldOptions('city');
                      if (opts.length > 1) {
                        return (
                          <div className="mt-1 flex flex-wrap gap-1 items-center p-1.5 rounded border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mr-1" style={{ color: '#2dd4bf' }}>Choose City:</span>
                            {opts.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setQuoteForm(prev => ({ ...prev, city: opt }));
                                  setTimeout(handleUpdateQuotePreview, 50);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                  quoteForm.city === opt 
                                    ? 'border-teal-500/40 font-semibold' 
                                    : 'border-slate-800 hover:border-slate-700'
                                }`}
                                style={{
                                  color: quoteForm.city === opt ? '#5eead4' : '#cbd5e1',
                                  backgroundColor: quoteForm.city === opt ? 'rgba(20, 184, 166, 0.2)' : '#0f172a'
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Contact Person (writes to B12)</label>
                    <input 
                      type="text" 
                      value={quoteForm.contact}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, contact: e.target.value }))}
                      onBlur={handleUpdateQuotePreview}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                    {(() => {
                      const opts = getFieldOptions('contact');
                      if (opts.length > 1) {
                        return (
                          <div className="mt-1 flex flex-wrap gap-1 items-center p-1.5 rounded border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mr-1" style={{ color: '#2dd4bf' }}>Choose Contact:</span>
                            {opts.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setQuoteForm(prev => ({ ...prev, contact: opt }));
                                  setTimeout(handleUpdateQuotePreview, 50);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                  quoteForm.contact === opt 
                                    ? 'border-teal-500/40 font-semibold' 
                                    : 'border-slate-800 hover:border-slate-700'
                                }`}
                                style={{
                                  color: quoteForm.contact === opt ? '#5eead4' : '#cbd5e1',
                                  backgroundColor: quoteForm.contact === opt ? 'rgba(20, 184, 166, 0.2)' : '#0f172a'
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Quotation Date (writes to I9)</label>
                    <input 
                      type="date" 
                      value={quoteForm.date}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, date: e.target.value }))}
                      onBlur={handleUpdateQuotePreview}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-medium">Sales Rep (writes to I10)</label>
                    <input 
                      type="text" 
                      value={quoteForm.repName}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, repName: e.target.value }))}
                      onBlur={handleUpdateQuotePreview}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                    {(() => {
                      const opts = getFieldOptions('repName');
                      if (opts.length > 1) {
                        return (
                          <div className="mt-1 flex flex-wrap gap-1 items-center p-1.5 rounded border border-slate-800" style={{ backgroundColor: '#0f172a' }}>
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mr-1" style={{ color: '#2dd4bf' }}>Choose Sales Rep:</span>
                            {opts.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setQuoteForm(prev => ({ ...prev, repName: opt }));
                                  setTimeout(handleUpdateQuotePreview, 50);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                  quoteForm.repName === opt 
                                    ? 'border-teal-500/40 font-semibold' 
                                    : 'border-slate-800 hover:border-slate-700'
                                }`}
                                style={{
                                  color: quoteForm.repName === opt ? '#5eead4' : '#cbd5e1',
                                  backgroundColor: quoteForm.repName === opt ? 'rgba(20, 184, 166, 0.2)' : '#0f172a'
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Additional Work done/not done toggle and Down Payment */}
                  <div className="col-span-2 border-t border-slate-800/80 pt-3.5 mt-1 flex flex-col gap-3">
                    <span className="text-[11px] text-teal-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
                      Work Status & Payment (Optional)
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-450 font-medium">Additional Work Status</label>
                        <select
                          id="sel-work-status"
                          value={quoteForm.workStatus || "None"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteForm(prev => ({ ...prev, workStatus: val }));
                            setSheetDoc(prev => ({
                              ...prev,
                              details: {
                                ...prev.details,
                                workStatus: val
                              }
                            }));
                          }}
                          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500 font-sans"
                        >
                          <option value="None">None (Do not display)</option>
                          <option value="Done">Yes (Done / Completed)</option>
                          <option value="Not Done">No (Not Done / Pending)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-450 font-medium">Down / Part Payment</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-slate-500 text-xs font-mono">{activeCurrency}</span>
                          <input 
                            id="num-down-payment"
                            type="number" 
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={quoteForm.downPayment === 0 ? "" : quoteForm.downPayment}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setQuoteForm(prev => ({ ...prev, downPayment: val }));
                              setSheetDoc(prev => ({
                                ...prev,
                                details: {
                                  ...prev.details,
                                  downPayment: val
                                }
                              }));
                            }}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500 w-full text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Add Item Panel (Faster visual replacement to recursive MsgBox loops) */}
                <div>
                  <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
                    Line Item Insertion Loop (VBA Section)
                  </h3>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-3">
                    <div className="text-xs flex flex-col gap-1">
                      <label className="text-slate-400">Item Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Workspace Organizer Units"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          value={newItemQty === 0 ? "" : newItemQty}
                          onChange={(e) => setNewItemQty(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">Unit Price</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={newItemPrice === 0 ? "" : newItemPrice}
                          onChange={(e) => setNewItemPrice(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div className="text-xs text-slate-400">
                        Line Total: <span className="font-mono text-white text-sm font-semibold">{formatCurrency(newItemQty * newItemPrice)}</span>
                      </div>
                      <button 
                        id="btn-add-item"
                        onClick={handleAddLineItem}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-1.5 rounded text-xs font-bold leading-none flex items-center gap-1 transition-all"
                      >
                        <Plus className="h-3 w-3" /> Insert Item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Local Grid Item List */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Draft Line Items ({activeQuoteItems.length} active)
                  </span>
                  {activeQuoteItems.length === 0 ? (
                    <div className="text-xs text-slate-600 italic bg-slate-950/40 p-3 text-center rounded-lg border border-slate-900">
                      No items added yet. Use the insertion loop block above.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-1.5 text-xs">
                      {activeQuoteItems.map((item) => (
                        <div key={item.id} className="flex flex-col bg-slate-950 p-2.5 rounded border border-slate-850 gap-2">
                          {editingLineItemId === item.id ? (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Edit Description</label>
                                <input 
                                  type="text" 
                                  value={editingLineItemDesc}
                                  onChange={(e) => setEditingLineItemDesc(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Qty</label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={editingLineItemQty}
                                    onChange={(e) => setEditingLineItemQty(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Unit Price</label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    value={editingLineItemPrice}
                                    onChange={(e) => setEditingLineItemPrice(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs mt-1 pt-1.5 border-t border-slate-900">
                                <span className="font-mono text-teal-400 font-semibold">Total: {formatCurrency(editingLineItemQty * editingLineItemPrice)}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLineItemEdit(item.id)}
                                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 p-1.5 rounded transition-all flex items-center justify-center cursor-pointer"
                                    title="Save changes"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditLineItem}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition-all flex items-center justify-center cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate text-xs" title={item.desc}>{item.desc}</div>
                                <div className="text-[10px] text-slate-450 font-mono">
                                  {item.qty} x {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-teal-400">{formatCurrency(item.total)}</span>
                                <button 
                                  onClick={() => handleStartEditLineItem(item)}
                                  className="text-slate-500 hover:text-white p-1 rounded transition-all cursor-pointer"
                                  title="Edit Item"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveLineItem(item.id)}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quotation Comments / Bullets Section */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-teal-400" />
                      Quote Comment Bullets
                    </span>
                    <span className="text-[10px] text-slate-500 italic">First is permanent</span>
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-2.5">
                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add another comment bullet point..."
                        id="input-add-comment"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setQuoteComments(prev => [...prev, val]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('input-add-comment') as HTMLInputElement;
                          const val = input?.value.trim();
                          if (val) {
                            setQuoteComments(prev => [...prev, val]);
                            input.value = '';
                          }
                        }}
                        className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-350 border border-teal-500/10 px-2.5 py-1 rounded text-xs font-bold font-sans transition-all"
                        id="btn-add-comment"
                      >
                        Add
                      </button>
                    </div>

                    {/* Comment List */}
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                      {quoteComments.map((comment, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/50 hover:border-slate-850 transition-all text-xs text-slate-300"
                        >
                          {editingCommentIndex === index ? (
                            <div className="flex flex-col gap-2 w-full">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-sans min-h-[50px] resize-y"
                              />
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCommentEdit(index)}
                                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 p-1 rounded transition-all cursor-pointer flex items-center justify-center"
                                  title="Save comment"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditComment}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded transition-all cursor-pointer flex items-center justify-center"
                                  title="Cancel edit"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5 min-w-0">
                                <span className="text-teal-400 font-bold shrink-0 mt-0.5">•</span>
                                <span className="leading-relaxed select-text text-[11px] text-slate-300 font-medium" title={comment}>
                                  {comment}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentIndex(index);
                                    setEditingCommentText(comment);
                                  }}
                                  className="text-slate-500 hover:text-white p-0.5 rounded transition-all cursor-pointer"
                                  title="Edit comment bullet"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                {index > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuoteComments(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="text-slate-500 hover:text-red-450 p-0.5 rounded transition-all cursor-pointer"
                                    title="Remove comment bullet"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[8px] bg-slate-950 text-slate-500 border border-amber-500/10 px-1 py-0.5 rounded font-mono">
                                    Permanent
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {editingQuoteId ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        id="btn-update-saved-quotation"
                        onClick={handleUpdateSavedQuotation}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Save Changes to {editingQuoteId}
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            // Save as a new copy
                            setEditingQuoteId(null);
                            setTimeout(() => {
                              handleSaveQuotation();
                            }, 50);
                          }}
                          className="bg-slate-800 hover:bg-slate-705 text-white font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-slate-700 text-center"
                        >
                          Save as New Copy
                        </button>
                        <button 
                          type="button"
                          onClick={handleCancelQuoteEdit}
                          className="bg-slate-950 hover:bg-slate-900 text-slate-400 font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-slate-850 text-center"
                        >
                          Exit Edit Mode
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      id="btn-save-quotation"
                      onClick={handleSaveQuotation}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save Quotation & Log (Stage 6)
                    </button>
                  )}
                </div>

                {/* Clear / Reset Workspace section */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 italic">Need to start completely fresh?</span>
                  <button
                    type="button"
                    onClick={handleClearInvoiceAndComments}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    id="btn-clear-quotation-workspace"
                    title="Clear quotation entries, lines, and comments"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    Reset Workspace
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'invoice' && (
              <motion.div 
                key="invoice-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-center bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-lg font-mono mb-2 border border-purple-500/10 self-start">
                    EXCEL WORKSHEET: Invoice_Template
                  </div>
                  <h2 className="text-md font-bold text-white flex items-center gap-2">
                    Finalize Invoice (wsInv Stage)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Converts an existing generated Quote into an Invoice template, requesting an Order Number, filling in Dates, and executing double total auditing formulas.</p>
                </div>

                 {/* Select Quote */}
                 <div className="flex flex-col gap-1.5 text-xs">
                   <label className="text-slate-400 font-medium">Select Quote ID (logs in wsQuote J2)</label>
                   <select 
                     value={selectedQuoteId}
                     onChange={(e) => {
                       const qId = e.target.value;
                       setSelectedQuoteId(qId);
                       
                       let parentDetails: DocumentDetails;
                       let parentItems: LineItem[];

                       if (qId === '__ACTIVE_DRAFT__') {
                         const generatedID = generateJobID(quoteForm.clientName);
                         parentDetails = {
                           jobID: generatedID,
                           ...quoteForm
                         };
                         parentItems = [...activeQuoteItems];
                       } else {
                         const parentQuote = finalizedQuotes.find(q => q.id === qId);
                         if (parentQuote) {
                           parentDetails = { ...parentQuote.details };
                           parentItems = [...parentQuote.items];
                         } else {
                           return;
                         }
                       }

                       setSheetDoc({
                         type: 'INVOICE',
                         details: {
                           ...parentDetails,
                           orderNum: invoiceOrderNum,
                           date: invoiceDate
                         },
                         items: parentItems
                       });
                     }}
                     className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                   >
                     <option value="" disabled>-- Select a logged Quotation --</option>
                     <option value="__ACTIVE_DRAFT__">
                       ★ LIVE BUILDER DRAFT: {quoteForm.clientName || 'Untitled'} ({formatCurrency(activeQuoteItems.reduce((acc, item) => acc + item.total, 0))})
                     </option>
                     {finalizedQuotes.map(q => (
                       <option key={q.id} value={q.id}>
                         {q.id} - {q.details.clientName} ({formatCurrency(q.subtotal)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Input box helper */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-xs flex flex-col gap-3">
                  <div className="text-[11px] text-teal-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-ping"></span>
                    Simulated User Prompts:
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-slate-450">Enter Order Number (VBA InputBox writes to J32/I11)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. PO-77123"
                      value={invoiceOrderNum}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvoiceOrderNum(val);
                        setSheetDoc(prev => {
                          if (prev.type === 'INVOICE') {
                            return {
                              ...prev,
                              details: {
                                ...prev.details,
                                orderNum: val
                              }
                            };
                          }
                          return prev;
                        });
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-450">Invoice Date (writes to I9)</label>
                    <input 
                      type="date" 
                      value={invoiceDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvoiceDate(val);
                        setSheetDoc(prev => {
                          if (prev.type === 'INVOICE') {
                            return {
                              ...prev,
                              details: {
                                ...prev.details,
                                date: val
                              }
                            };
                          }
                          return prev;
                        });
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 border-t border-slate-800/80 pt-2.5 mt-0.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-450">Additional Work Done?</label>
                      <select
                        id="sel-work-status-invoice"
                        value={sheetDoc.details.workStatus || "None"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSheetDoc(prev => ({
                            ...prev,
                            details: {
                              ...prev.details,
                              workStatus: val
                            }
                          }));
                          // Also sync to form
                          setQuoteForm(prev => ({ ...prev, workStatus: val }));
                        }}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500 font-sans"
                      >
                        <option value="None">None (Do not display)</option>
                        <option value="Done">Yes (Done / Completed)</option>
                        <option value="Not Done">No (Not Done / Pending)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-450 font-medium">Down / Part Payment</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-mono">{activeCurrency}</span>
                        <input 
                          id="num-down-payment-invoice"
                          type="number" 
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={sheetDoc.details.downPayment === 0 || !sheetDoc.details.downPayment ? "" : sheetDoc.details.downPayment}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setSheetDoc(prev => ({
                              ...prev,
                              details: {
                                ...prev.details,
                                downPayment: val
                              }
                            }));
                            // Also sync to form
                            setQuoteForm(prev => ({ ...prev, downPayment: val }));
                          }}
                          className="bg-slate-900 border border-slate-800 rounded pl-7 pr-2.5 py-1.5 text-white focus:outline-none text-xs font-mono w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    id="btn-run-finalize"
                    onClick={handleFinalizeInvoice}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <RefreshCw className="h-4 w-4 animate-spin-slow" /> Generate Invoice Frame (Stage 2-6)
                  </button>
                  <p className="text-[10px] text-slate-500 text-center italic">
                    Runs Stage 2 (copy items), Stage 3 (fill headers), Stage 4 (calc SUM/2 formula), Stage 5 (Accounting formatting).
                  </p>
                </div>

                {/* Quick select helpful items */}
                <div className="flex flex-col gap-2 mt-4 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Quick Demo Templates</span>
                  <div className="grid grid-cols-2 gap-2">
                    {finalizedQuotes.map((q, idx) => (
                      <button 
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuoteId(q.id);
                          setSheetDoc({
                            type: 'INVOICE',
                            details: {
                              ...q.details,
                              orderNum: invoiceOrderNum,
                              date: invoiceDate
                            },
                            items: [...q.items]
                          });
                        }}
                        className="text-left bg-slate-900 hover:bg-slate-800 p-2 rounded border border-slate-800 text-[10px] text-slate-300 transition-all truncate"
                      >
                        <div className="font-bold text-white font-mono">{q.id}</div>
                        <div className="truncate">{q.details.clientName}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear / Reset Workspace section */}
                <div className="border-t border-slate-800/80 pt-3 mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 italic">Want to clear active entries & comments?</span>
                  <button
                    type="button"
                    onClick={handleClearInvoiceAndComments}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    id="btn-clear-invoice-workspace"
                    title="Clear entries, items, and comments"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    Reset Workspace
                  </button>
                </div>

              </motion.div>
            )}

            {activeTab === 'job_book' && (
              <motion.div 
                key="job-book-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-lg font-mono mb-2 border border-emerald-500/10 self-start">
                      EXCEL WORKSHEET: Job_Book
                    </div>
                    <h2 className="text-md font-bold text-white flex items-center gap-2">
                      Job Book Ledger Logs
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">This stores persistent data rows logged by the quote generator (VBA: Stage 2/Log to Job_Book).</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Clear simulated database?")) setJobBook([]);
                    }}
                    className="text-slate-500 hover:text-red-400 text-xs font-mono px-2 py-1 bg-slate-950 border border-slate-850 rounded"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Filter Job Book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                  />
                </div>

                <div className="overflow-x-auto max-h-[380px] bg-slate-950 rounded-lg border border-slate-850">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="p-2 font-mono">JobID</th>
                        <th className="p-2">Customer</th>
                        <th className="p-2 text-center font-mono">Qty</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono">
                      {jobBook.filter(e => 
                        e.jobID.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.desc.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">No logs found matching search.</td>
                        </tr>
                      ) : (
                        jobBook.filter(e => 
                          e.jobID.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.desc.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((entry, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40 text-slate-300">
                            <td className="p-2 text-teal-400 font-semibold">{entry.jobID}</td>
                            <td className="p-2 font-sans text-slate-200">{entry.clientName}</td>
                            <td className="p-2 text-center">{entry.qty}</td>
                            <td className="p-2 font-sans truncate max-w-[150px]" title={entry.desc}>{entry.desc}</td>
                            <td className="p-2 text-right">{formatCurrency(entry.unitPrice)}</td>
                            <td className="p-2 text-right text-teal-400 font-semibold">{formatCurrency(entry.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850/50 flex items-center gap-2.5 text-xs text-slate-400">
                  <TrendingUp className="h-5 w-5 text-teal-500 shrink-0" />
                  <div>
                    The <span className="font-bold text-white">clientCount</span> logic automatically watches this table. E.g., when adding "Initech Corporation" again, it increments Count & adjusts Job ID formula correctly!
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'design_docs' && (
              <motion.div 
                key="design-docs-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-900 border-2 border-teal-500/20 rounded-xl p-5 flex flex-col gap-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-center bg-teal-500/10 text-teal-400 text-xs px-3 py-1 rounded-lg font-mono mb-2 border border-teal-500/20 self-start">
                    CO-DESIGN SPECIFICATIONS
                  </div>
                  <h2 className="text-md font-bold text-white flex items-center gap-2">
                    Requirements & Verification Questions
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Below are the primary parameters we need to clarify with your Excel template before finalizing compiling the code.</p>
                </div>

                <div className="text-xs flex flex-col gap-3">
                  
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <span className="font-bold text-teal-400 flex items-center gap-1">
                      <span className="bg-teal-400 text-slate-950 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold">1</span>
                      Header Layout & Brand Identity (Rows 1-8)
                    </span>
                    <p className="text-slate-350 leading-relaxed text-[11px]">
                      Your VBA script starts populating from <strong>Row 9 (B9:B12)</strong> and metadata on <strong>Row 2 & 9 (J2, I9, I10, I11)</strong>. 
                      Is there any pre-defined company template or logo graphic on rows 1 through 8? What specific static texts, company info, bank accounts, or colored grids reside in those cells?
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <span className="font-bold text-teal-400 flex items-center gap-1">
                      <span className="bg-teal-400 text-slate-950 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold">2</span>
                      Column Definitions (Cols A through J)
                    </span>
                    <p className="text-slate-350 leading-relaxed text-[11px]">
                      Your script writes <strong>Quantity (Qty)</strong> to Column A, merges description in <strong>B:H</strong>, writes <strong>Unit Price</strong> to Column I, and computed <strong>Total</strong> dynamically into Column J.
                      Should the final desktop application support custom column headers (e.g., SKU, VAT, Discount, weight), or is the structure strictly matching this current pattern?
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <span className="font-bold text-teal-400 flex items-center gap-1">
                      <span className="bg-teal-400 text-slate-950 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold">3</span>
                      Database Ledger Options
                    </span>
                    <p className="text-slate-350 leading-relaxed text-[11px]">
                      Currently, <strong>Job_Book</strong> records a flat logging of individual items. For a robust standalone app, do you prefer a local database file (SQLite / JSON) so that past quotes and customer tables persist forever when closing the app, or should it sync to a remote secure Cloud database?
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-teal-500/20 flex flex-col gap-2">
                    <span className="font-bold text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 shrink-0" /> Note on Grand Total Sum Formula:
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      In Stage 4, the Grand Total calculation does a very clever trick: 
                      <code className="text-yellow-300 font-mono block bg-slate-900 p-1.5 rounded mt-1">=SUM(J15:J29)/2</code>
                      Since row 15-29 contains items AND the "SUBTOTAL:" value, Excel would double up on the values when summing. Therefore, dividing by 2 returns the true single grand total correctly!
                      We have simulated this exact formula behavior in our template on the right side!
                    </p>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* Corporate Branding & Logo Customizer Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Identity & Logo</h3>
              </div>
              <span className="text-[10px] font-mono bg-teal-950/50 text-teal-350 px-2 py-0.5 rounded border border-teal-500/10">Rows 1-5</span>
            </div>

            <div className="text-xs flex flex-col gap-3">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-300 font-semibold text-[11px]">Render Branding Image</span>
                  <span className="text-slate-500 text-[10px]">Toggles image on PDF & Print sheets</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBrShowLogo(!brShowLogo)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all cursor-pointer ${
                    brShowLogo ? 'bg-teal-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                  id="btn-toggle-show-logo"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md"></span>
                </button>
              </div>

              {brShowLogo && (
                <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col gap-2">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Logo Asset Choice</span>
                  
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setBrCompanyLogo(companyLogo)}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded border text-[9px] font-semibold transition-all ${
                        brCompanyLogo === companyLogo ? 'bg-teal-950/40 border-teal-500/40 text-teal-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-350'
                      }`}
                      id="btn-select-gen-logo"
                    >
                      <img 
                        src={companyLogo} 
                        alt="Generated Tech Logo" 
                        className="h-8 w-8 object-contain bg-white rounded p-0.5"
                        referrerPolicy="no-referrer"
                      />
                      <span>Generated</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBrCompanyLogo("https://picsum.photos/seed/techlogo/100/100")}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded border text-[9px] font-semibold transition-all ${
                        brCompanyLogo === "https://picsum.photos/seed/techlogo/100/100" ? 'bg-teal-950/40 border-teal-400/40 text-teal-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-350'
                      }`}
                      id="btn-select-alt-logo"
                    >
                      <img 
                        src="https://picsum.photos/seed/techlogo/100/100" 
                        alt="Alternative Logo" 
                        className="h-8 w-8 object-contain bg-white rounded p-0.5"
                        referrerPolicy="no-referrer"
                      />
                      <span>Abstract UI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newUrl = prompt("Enter custom image URL:", brCompanyLogo);
                        if (newUrl) setBrCompanyLogo(newUrl);
                      }}
                      className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded border text-[9px] font-semibold transition-all ${
                        brCompanyLogo !== companyLogo && brCompanyLogo !== "https://picsum.photos/seed/techlogo/100/100" ? 'bg-teal-950/40 border-teal-500/40 text-teal-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-350'
                      }`}
                      id="btn-select-custom-logo"
                    >
                      <div className="h-8 w-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded text-slate-400 text-xs font-mono font-bold">+</div>
                      <span>Custom URL</span>
                    </button>
                  </div>

                  {/* Interactive Drag & Drop + Manual Select File Upload */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('logo-file-input')?.click()}
                    className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all mt-1.5 flex flex-col items-center justify-center gap-1.5 ${
                      dragOver 
                        ? 'border-teal-400 bg-teal-950/20 text-teal-300' 
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400'
                    }`}
                    id="logo-dropzone"
                  >
                    <input 
                      type="file" 
                      id="logo-file-input" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                    <Upload className={`h-4 w-4 ${dragOver ? 'text-teal-400 animate-bounce' : 'text-slate-500'}`} />
                    <div className="text-[10px] font-sans">
                      <span className="text-teal-400 font-bold hover:underline">Click to upload</span> or drag and drop your logo
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Supports PNG, JPG, SVG, WebP</div>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] text-slate-500 font-mono uppercase">OR ENTER LOGO IMAGE URL</label>
                    <input 
                      type="text"
                      value={brCompanyLogo}
                      onChange={(e) => setBrCompanyLogo(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none font-mono text-[9px]"
                      placeholder="e.g. https://example.com/logo.png"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Company Name (Writes to Header)</label>
                <input 
                  type="text"
                  value={brCompanyName}
                  onChange={(e) => setBrCompanyName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-bold"
                  placeholder="Parkvan Calibration™ (Pvt) Ltd"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Bottom Footer Slogan</label>
                <input 
                  type="text"
                  value={brCompanyFooterTagline}
                  onChange={(e) => setBrCompanyFooterTagline(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-xs font-semibold"
                  placeholder="YOUR TRUSTED WETSTOCK & CALIBRATION PARTNER™"
                />
                
                <div className="mt-1.5 p-2.5 bg-slate-950/80 border border-slate-850 rounded-lg space-y-1">
                  <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wider block font-bold">Suggested Professional Copy (Click to apply):</span>
                  <div className="flex flex-col gap-1">
                    {[
                      "YOUR TRUSTED WETSTOCK & CALIBRATION PARTNER™",
                      "CERTIFIED FUEL METROLOGY & COMPLIANCE SOLUTIONS™",
                      "PRECISION METROLOGY, CALIBRATION & WETSTOCK AUDIT EXPERTS™",
                      "AFRICA'S STANDARD FOR CALIBRATION & FUEL VERIFICATION™",
                      "PREMIUM FUEL DISPENSERS, CALIBRATION & MAINTENANCE™"
                    ].map((tagline, idx) => (
                      <button 
                        key={idx}
                        type="button" 
                        onClick={() => setBrCompanyFooterTagline(tagline)}
                        className="text-[10px] text-zinc-400 hover:text-white transition-colors text-left bg-transparent border-none p-0 flex items-start gap-1 cursor-pointer font-sans"
                      >
                        <span className="text-teal-400 font-bold font-mono">»</span>
                        <span className="hover:underline">{tagline}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Tagline or Subtitle</label>
                <input 
                  type="text"
                  value={brCompanyTagline}
                  onChange={(e) => setBrCompanyTagline(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="PRECISION. RELIABILITY. COMPLIANCE."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Company Address</label>
                <input 
                  type="text"
                  value={brCompanyAddress}
                  onChange={(e) => setBrCompanyAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
                  placeholder="119 Harare Drive, Hatfield, HARARE"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Company Email</label>
                <input 
                  type="text"
                  value={brCompanyEmail}
                  onChange={(e) => setBrCompanyEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="info@parkvan-calibration.co.zw"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium font-sans">Company Phone</label>
                <input 
                  type="text"
                  value={brCompanyPhone}
                  onChange={(e) => setBrCompanyPhone(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="0778 924 209"
                />
              </div>
            </div>
          </div>
          
        </section>

        {/* Right Side: High Fidelity Grid Sheet Render (WYSIWYG) */}
        <section id="wysiwyg-preview-section" className="lg:col-span-7 flex flex-col gap-3">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-200">WYSIWYG Excel Canvas Preview</span>
              </div>
              
              {/* Layout Mode Segmented Control Toggle */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setExcelStyleMode('excel')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    excelStyleMode === 'excel' 
                      ? 'bg-teal-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-style-excel"
                >
                  Excel Grid
                </button>
                <button
                  type="button"
                  onClick={() => setExcelStyleMode('clean')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    excelStyleMode === 'clean' 
                      ? 'bg-teal-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="btn-style-clean"
                >
                  Clean PDF
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className={`bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 px-3.5 py-1.5 rounded flex items-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer shadow border border-transparent ${
                  isGeneratingPDF ? 'opacity-70 cursor-wait' : ''
                }`}
                id="btn-direct-download-pdf"
                title="Generates and downloads a perfect single-page PDF directly on your device (highly recommended for Android/mobile)"
              >
                {isGeneratingPDF ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Download PDF (Android/Mobile)
                  </>
                )}
              </button>

              <button 
                onClick={handlePrintDocument}
                disabled={isGeneratingPDF}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-3.5 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow border border-slate-700"
                id="btn-native-print"
                title="Opens the standard system print dialog (may not work inside sandboxed mobile browsers)"
              >
                <Printer className="h-3.5 w-3.5 text-slate-400" /> Print / Save via Browser
              </button>
            </div>
          </div>

          {/* Realistic Excel Spreadsheet Grid Container */}
          <div id="excel-grid-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 overflow-x-auto shadow-xl print:p-0 print:bg-white print:border-none">
            
            <div 
              ref={sheetRef} 
              id="quote-print-canvas"
              className={`min-w-[660px] bg-white text-zinc-900 relative mx-auto transition-all ${
                isGeneratingPDF 
                  ? 'border-none shadow-none rounded-none' 
                  : 'rounded border border-slate-300 shadow-sm'
              } ${
                excelStyleMode === 'excel' 
                  ? 'p-3 pt-6 print:p-0' 
                  : isUltraCrowded 
                    ? 'p-5 print:p-4' 
                    : isVeryCrowded 
                      ? 'p-6 print:p-5' 
                      : isCrowded 
                        ? 'p-8 print:p-6' 
                        : 'p-10 print:p-8'
              }`} 
              style={{ minHeight: '960px', width: '100%', maxWidth: '760px' }}
            >
              


              {/* Grid Header Columns Bar (Excel top letters A to J) */}
              {excelStyleMode === 'excel' && (
                <div className="flex w-full items-stretch text-center font-mono text-[9px] text-zinc-500 bg-[#f8f9fa] border-t border-l border-r border-[#cbd5e1] select-none uppercase font-bold print:hidden">
                  <div className="w-8 h-5 bg-[#eaecef] border-r border-b border-[#cbd5e1] flex items-center justify-center"></div>
                  <div className="w-[10%] h-5 border-r border-b border-[#cbd5e1] flex items-center justify-center bg-zinc-100">A (QTY)</div>
                  <div className="w-[55%] h-5 border-r border-b border-[#cbd5e1] flex items-center justify-center bg-zinc-100">B - H (DESCRIPTION / ITEMS)</div>
                  <div className="w-[17%] h-5 border-r border-b border-[#cbd5e1] flex items-center justify-center bg-zinc-100">I (UNIT)</div>
                  <div className="w-[18%] h-5 border-r border-b border-[#cbd5e1] flex items-center justify-center bg-zinc-100">J (TOTAL)</div>
                </div>
              )}

              {/* Excel Sheets Grid Rows mapped precisely with double formula summations */}
              <div className={`w-full flex flex-col ${excelStyleMode === 'excel' ? 'border-r border-[#cbd5e1]' : 'gap-1'}`}>
                     {/* ROW 1: Branding Name, Elegant Logo & Metadata Info Header */}
                <div className="w-full" id="excel-row-1">
                  {excelStyleMode === 'clean' ? (
                    <div className="w-full flex justify-between items-center pb-3 border-b-[2px] border-[#09090b] gap-4">
                      {/* Left Side: Logo Block (visually balanced & compact) */}
                      <div className="flex items-center select-none justify-start min-w-[150px]">
                        {brShowLogo && brCompanyLogo && (
                          <img 
                            src={brCompanyLogo} 
                            alt="Parkvan Calibration Logo" 
                            className="w-auto max-w-[180px] object-contain transition-all" 
                            style={{ maxHeight: logoMaxHeightStyle }}
                            referrerPolicy="no-referrer" 
                          />
                        )}
                      </div>
                      
                      {/* Middle: Address block with website domain replacing company name */}
                      <div className="flex-1 text-center font-sans select-text hover:bg-zinc-50/80 transition-all rounded p-1">
                        <a 
                          href="https://parkvan-calibration.co.zw/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-black text-[#0A2E5C] hover:underline text-[12.5px] block mb-0.5"
                        >
                          https://parkvan-calibration.co.zw/
                        </a>
                        <p className={`whitespace-pre-line text-zinc-800 font-extrabold transition-all ${headerAddressFontSizeClass}`}>
                          {brCompanyAddress}
                        </p>
                      </div>

                      {/* Right Side: Document Reference and Pill aligned right */}
                      <div className="text-right font-sans font-bold min-w-[150px] pr-1 flex items-center justify-end gap-3">
                        <span 
                          className="text-[12.5px] font-black tracking-widest uppercase font-sans text-red-print"
                          style={{ color: '#dc2626' }}
                        >
                          {sheetDoc.type === 'QUOTE' ? 'QUOTE' : 'INVOICE'}
                        </span>
                        <span 
                          className="text-[13px] font-black font-mono tracking-tight bg-transparent px-1 py-0.5 select-all text-zinc-950"
                          style={{ color: '#09090b' }}
                        >
                          {sheetDoc.details.jobID}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* ORIGINAL CELL GRID STRUCTURE FOR EXCEL TABULAR ROW */
                    <div className="w-full flex justify-between items-center pb-3 border-b border-[#e4e4e7] gap-4" id="original_header_grid">
                      {/* Left Side Logo */}
                      <div className="flex items-center select-none justify-start min-w-[120px]">
                        {brShowLogo && brCompanyLogo && (
                          <img 
                            src={brCompanyLogo} 
                            alt="Parkvan Calibration Logo" 
                            className="w-auto max-w-[180px] object-contain transition-all" 
                            style={{ maxHeight: logoMaxHeightStyle }}
                            referrerPolicy="no-referrer" 
                          />
                        )}
                      </div>

                      {/* Middle Address Box with website domain replacing company name */}
                      <div className="text-center font-sans font-medium text-zinc-850 select-text flex-1">
                        <a 
                          href="https://parkvan-calibration.co.zw/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-black text-[#0A2E5C] hover:underline text-[12px] block mb-0.5"
                        >
                          https://parkvan-calibration.co.zw/
                        </a>
                        <p className={`whitespace-pre-line text-zinc-800 font-extrabold transition-all ${headerAddressFontSizeClass}`}>
                          {brCompanyAddress}
                        </p>
                      </div>

                      {/* Right Doc Reference */}
                      <div className="text-right font-sans font-bold min-w-[120px] pr-1 flex items-center justify-end gap-3.5">
                        <span 
                          className="text-[12px] font-extrabold tracking-widest uppercase font-mono text-red-print"
                          style={{ color: '#dc2626' }}
                        >
                          {sheetDoc.type === 'QUOTE' ? 'QUOTE' : 'INVOICE'}
                        </span>
                        <span 
                          className="text-[13px] font-extrabold font-mono tracking-tight bg-transparent px-1 py-0.5 select-all text-zinc-950"
                          style={{ color: '#09090b' }}
                        >
                          {sheetDoc.details.jobID}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepped Horizontal Divider Box Banner */}
                <div className={`relative w-full select-none transition-all ${bannerHeightClass}`}>
                  {/* Symmetrical Left horizontal line: runs fully across to ensure subpixel perfect alignment under the box */}
                  <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#0A2E5C] z-0"></div>
                  
                  {/* Right box: width is exactly 200px, bottom-0, border-3px (border-b-0), matching the left line perfect alignment */}
                  <div className="absolute right-0 bottom-0 bg-white border-[3px] border-[#0A2E5C] border-b-0 px-8 flex items-center justify-center w-[200px] h-full" style={{ zIndex: 10 }}>
                    <span 
                      className={`font-sans font-black uppercase tracking-wider text-zinc-950 transition-all ${bannerFontSizeClass}`}
                      style={{ color: '#09090b' }}
                    >
                      {sheetDoc.type === 'QUOTE' ? 'QUOTATION' : 'INVOICE'}
                    </span>
                  </div>
                </div>
                            {/* 3. Customer Info Cards Layout Row */}
                {excelStyleMode === 'clean' ? (
                  <div className={`grid grid-cols-12 w-full select-text font-sans transition-all ${billingBlockMarginClass}`}>
                    {/* Left Side: Customer Info Block */}
                    <div className="col-span-7 flex flex-col border-[1.5px] border-[#09090b] rounded-none bg-white">
                      {/* Header bar */}
                      <div className="bg-[#0A2E5C] text-white px-3 py-1 text-[10.5px] font-black uppercase tracking-wider rounded-none">
                        Customer Details
                      </div>
                      
                      {/* Grid Body */}
                      <div className="flex flex-col">
                        <div className="flex border-b border-[#d4d4d8] items-stretch justify-start" id="customer-row-name">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">Name</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-955 font-black uppercase select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.clientName}</span>
                        </div>
                        
                        <div className="flex border-b border-[#d4d4d8] items-stretch justify-start" id="customer-row-addr">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">Address</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-805 font-extrabold select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.addr}</span>
                        </div>
                        
                        <div className="flex border-b border-[#d4d4d8] items-stretch justify-start" id="customer-row-city">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">City</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-805 font-extrabold select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.city || 'Harare'}</span>
                        </div>
                        
                        <div className="flex items-stretch justify-start" id="customer-row-contact">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">Contact</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-900 font-black select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.contact}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Misc Block - static col-span-5 to protect side-by-side printing layout block */}
                    <div className="col-span-5 flex flex-col border-[1.5px] border-[#09090b] rounded-none bg-white">
                      {/* Header bar */}
                      <div className="bg-[#0A2E5C] text-white px-3 py-1 text-[10.5px] font-black uppercase tracking-wider rounded-none">
                        Document Metadata
                      </div>
                      
                      {/* Grid Body */}
                      <div className="flex flex-col flex-1 justify-stretch">
                        <div className="flex border-b border-[#d4d4d8] items-stretch flex-1" id="metadata-row-date">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-650 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">Date</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-955 font-black font-mono select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.date}</span>
                        </div>
                        
                        <div className="flex border-b border-[#d4d4d8] items-stretch flex-1" id="metadata-row-rep">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">Rep</span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-zinc-800 font-extrabold select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>{sheetDoc.details.repName}</span>
                        </div>
                        
                        <div className={`flex items-stretch flex-1 ${sheetDoc.details.workStatus && sheetDoc.details.workStatus !== "None" ? 'border-b border-[#d4d4d8]' : ''}`} id="metadata-row-ref">
                          <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">
                            {sheetDoc.type !== 'QUOTE' ? "Order #" : "Ref"}
                          </span>
                          <span className={`flex-1 pl-4 py-1.5 flex items-center text-[#0A2E5C] font-black font-mono select-all ${isVeryCrowded ? 'text-[11px]' : 'text-[11.5px]'}`}>
                            {sheetDoc.type !== 'QUOTE' ? (sheetDoc.details.orderNum || 'Verbal') : sheetDoc.details.jobID}
                          </span>
                        </div>
                        
                        {sheetDoc.details.workStatus && sheetDoc.details.workStatus !== "None" && (
                          <div className="flex items-stretch flex-1" id="metadata-row-workstatus">
                            <span className="w-24 pl-3 py-1.5 font-bold text-zinc-655 uppercase tracking-tight text-[9px] select-none border-r border-[#d4d4d8] flex items-center bg-zinc-50/70">
                              Add. Work
                            </span>
                            <span className={`flex-1 pl-4 py-1.5 flex items-center font-black uppercase text-[10px] select-all ${sheetDoc.details.workStatus === 'Done' ? 'text-emerald-700' : 'text-red-650'}`}>
                              {sheetDoc.details.workStatus === 'Done' ? '✓ DONE (COMPLETED)' : '✗ NOT DONE (PENDING)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original Excel Layout Row */
                  <div className="grid grid-cols-12 gap-6 w-full mt-2">
                    
                    {/* Left Side: Customer Info Box */}
                    <div className="col-span-7 relative border-t-[3.5px] border-l-[3.5px] border-[#0A2E5C] bg-[#f8fafc]/45 p-4 pt-5 text-xs font-sans rounded-tl shadow-xs text-left">
                      <div className="absolute -top-[11px] left-2.5 bg-white px-2.5 text-[#0A2E5C] text-[10px] font-black uppercase tracking-wider leading-none">
                        Customer
                      </div>
                      
                      <div className="flex border-b border-dotted border-zinc-200 py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Name</span>
                        <span className="flex-1 text-[#0A2E5C] font-extrabold font-mono text-[12.5px] uppercase select-text">{sheetDoc.details.clientName}</span>
                      </div>
                      
                      <div className="flex border-b border-dotted border-zinc-200 py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Address</span>
                        <span className="flex-1 text-zinc-805 font-bold select-text">{sheetDoc.details.addr}</span>
                      </div>
                      
                      <div className="flex border-b border-dotted border-zinc-200 py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">City</span>
                        <span className="flex-1 text-zinc-805 font-bold select-text">{sheetDoc.details.city || 'Harare'}</span>
                      </div>
                      
                      <div className="flex py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Contact</span>
                        <span className="flex-1 text-zinc-900 font-extrabold select-text">{sheetDoc.details.contact}</span>
                      </div>
                    </div>

                    {/* Right Side: Document parameters Box */}
                    <div className="col-span-5 relative border-t-[3.5px] border-l-[3.5px] border-[#0A2E5C] bg-[#f8fafc]/45 p-4 pt-5 text-xs font-sans rounded-tl shadow-xs text-left">
                      <div className="absolute -top-[11px] left-2.5 bg-white px-2.5 text-[#0A2E5C] text-[10px] font-black uppercase tracking-wider leading-none">
                        Misc
                      </div>
                      
                      <div className="flex border-b border-dotted border-zinc-200 py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Date</span>
                        <span className="flex-1 text-zinc-900 font-extrabold font-mono tracking-tight select-text">{sheetDoc.details.date}</span>
                      </div>
                      
                      <div className="flex border-b border-dotted border-zinc-200 py-1.5 items-center font-sans text-left">
                        <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Sales Rep</span>
                        <span className="flex-1 text-zinc-800 font-bold select-text">{sheetDoc.details.repName}</span>
                      </div>
                      
                      {sheetDoc.type !== 'QUOTE' ? (
                        <div className={`flex py-1.5 items-center font-sans text-left ${sheetDoc.details.workStatus && sheetDoc.details.workStatus !== "None" ? 'border-b border-dotted border-zinc-200' : ''}`}>
                          <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Order #</span>
                          <span className="flex-1 text-[#0A2E5C] font-extrabold font-mono select-text">{sheetDoc.details.orderNum || 'Verbal'}</span>
                        </div>
                      ) : (
                        sheetDoc.details.workStatus && sheetDoc.details.workStatus !== "None" ? null : (
                          <div className="h-6 print:hidden"></div>
                        )
                      )}

                      {sheetDoc.details.workStatus && sheetDoc.details.workStatus !== "None" && (
                        <div className="flex py-1.5 items-center font-sans text-left animate-fade-in">
                          <span className="w-16 font-bold text-zinc-500 uppercase tracking-tight text-[10px]">Add. Work</span>
                          <span className={`flex-1 font-extrabold text-[11px] select-text uppercase ${sheetDoc.details.workStatus === 'Done' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {sheetDoc.details.workStatus === 'Done' ? 'DONE' : 'NOT DONE'}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* ROW 15: Table Headers (Qty, Description, Unit Price, Total) */}
                <div className={`flex w-full items-stretch ${excelStyleMode === 'excel' ? 'border-l border-b border-[#cbd5e1]' : ''}`} id="excel-row-15">
                  {excelStyleMode === 'excel' ? (
                    <>
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-1.5 print:hidden">
                        15
                      </div>
                      <div className="w-[10%] border-r border-b border-[#cbd5e1] bg-zinc-100 py-1.5 px-1 flex items-center justify-center font-bold text-[9px] text-slate-800 uppercase text-center font-mono select-none">
                        Qty (A)
                      </div>
                      <div className="w-[55%] border-r border-b border-[#cbd5e1] bg-zinc-100 py-1.5 px-3 flex items-center font-bold text-[10px] text-slate-800 uppercase tracking-wide select-none">
                        Description (B-H Merged Specification Schedule)
                      </div>
                      <div className="w-[17%] border-r border-b border-[#cbd5e1] bg-zinc-100 py-1.5 px-3 flex items-center justify-end font-bold text-[9px] text-slate-800 uppercase select-none font-mono">
                        Unit Price (I)
                      </div>
                      <div className="w-[18%] border-b border-[#cbd5e1] bg-zinc-100 py-1.5 px-3 flex items-center justify-end font-bold text-[10px] text-slate-800 uppercase select-none font-mono">
                        Total (J)
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex bg-[#0A2E5C] text-white text-[10.5px] uppercase font-black tracking-wider py-2.5 border border-[#09090b] rounded-none mt-4 font-sans">
                      <div className="w-[10%] text-center border-r border-white/20 select-none">Qty</div>
                      <div className="w-[55%] text-left pl-4 select-none">Description</div>
                      <div className="w-[17%] text-right pr-4 border-l border-white/20 select-none">Unit Price</div>
                      <div className="w-[18%] text-right pr-4 select-none">Total</div>
                    </div>
                  )}
                </div>

                {/* ROWS 16 to 28: Exact items scheduler slots! Fill with active entries, otherwise render empty cell grid! */}
                {Array.from({ length: targetTotalRows }).map((_, slotIdx) => {
                  const itemIndex = slotIdx;
                  const rowNumber = 16 + slotIdx;
                  const item = sheetDoc.items[itemIndex];
                  
                  // In clean mode, if there's no item, don't render anything (makes clean invoice compact)
                  if (excelStyleMode === 'clean' && !item) return null;

                  return (
                    <div 
                      key={`excel-slot-row-${rowNumber}`}
                      className={`flex w-full items-stretch transition-colors ${
                        item ? 'bg-white' : 'bg-transparent'
                      } ${
                        excelStyleMode === 'excel' ? 'border-l border-b border-[#cbd5e1]' : 'rounded-none hover:bg-zinc-50/45'
                      }`}
                      id={`excel-row-${rowNumber}`}
                    >
                      {excelStyleMode === 'excel' && (
                        <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-400 flex items-center justify-center select-none py-1.5 print:hidden">
                          {rowNumber}
                        </div>
                      )}
                      
                      {item ? (
                        <>
                          <div className={`w-[10%] flex items-center justify-center font-bold ${
                            excelStyleMode === 'excel' 
                              ? `border-r border-b border-[#cbd5e1] bg-zinc-50/30 ${rowPaddingClass} text-center font-mono ${rowFontSizeClass}` 
                              : `border-l border-b border-[#09090b] ${rowPaddingClass} text-center font-black text-zinc-900 border-r border-[#cbd5e1] ${rowFontSizeClass}`
                          }`}>
                            {item.qty}
                          </div>
                          <div className={`w-[55%] flex items-center ${
                            excelStyleMode === 'excel' 
                              ? `border-r border-b border-[#cbd5e1] px-3 ${rowPaddingClass} text-slate-800 ${rowFontSizeClass}` 
                              : `border-b border-[#09090b] ${rowPaddingClass} pl-4 pr-1 text-zinc-900 leading-relaxed font-bold ${rowFontSizeClass}`
                          }`}>
                            {item.desc}
                          </div>
                          <div className={`w-[17%] flex items-center justify-end font-mono ${
                            excelStyleMode === 'excel' 
                              ? `border-r border-b border-[#cbd5e1] px-3 ${rowPaddingClass} text-slate-800 ${rowFontSizeClass}` 
                              : `border-b border-[#09090b] ${rowPaddingClass} pr-4 text-right text-zinc-800 font-semibold border-l border-[#cbd5e1] ${rowFontSizeClass}`
                          }`}>
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className={`w-[18%] flex items-center justify-end font-mono font-black ${
                            excelStyleMode === 'excel' 
                              ? `border-b border-[#cbd5e1] px-3 ${rowPaddingClass} text-[#115e59] ${rowFontSizeClass}` 
                              : `border-r border-b border-[#09090b] ${rowPaddingClass} pr-4 text-right text-zinc-955 font-black border-l border-[#cbd5e1] ${rowFontSizeClass}`
                          }`}>
                            {formatCurrency(item.total)}
                          </div>
                        </>
                      ) : (
                        /* Visual empty spacer rows matching Excel cells */
                        <>
                          <div className="w-[10%] border-r border-b border-[#cbd5e1] bg-zinc-50/10" style={{ minHeight: isUltraCrowded ? '20px' : isVeryCrowded ? '24px' : '32px' }}></div>
                          <div className="w-[55%] border-r border-b border-[#cbd5e1] px-3"></div>
                          <div className="w-[17%] border-r border-b border-[#cbd5e1] px-3"></div>
                          <div className="w-[18%] border-b border-[#cbd5e1] px-3"></div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* ROW 29: Floating SUBTOTAL row linked explicitly inside range sum limits */}
                {excelStyleMode === 'excel' ? (
                  <div className="flex w-full items-stretch border-l border-b border-[#cbd5e1] bg-zinc-50/50" id="excel-row-29">
                    <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-1.5 print:hidden">
                      29
                    </div>
                    <div className="flex-1 flex items-stretch min-w-0">
                      <div className="w-[10%] border-r border-b border-[#cbd5e1]"></div>
                      <div className="w-[55%] border-r border-b border-[#cbd5e1] px-3 py-1 flex items-center justify-end font-bold text-[9px] text-slate-500 uppercase tracking-widest bg-zinc-100">
                        SUBTOTAL: RANGE J15:J28
                      </div>
                      <div className="w-[17%] border-r border-b border-[#cbd5e1] px-3 bg-zinc-100 flex items-center justify-end font-mono text-[9px] text-zinc-400 uppercase tracking-wider select-none">
                        SUM
                      </div>
                      <div className="w-[18%] border-b border-[#cbd5e1] px-3 py-1 font-mono text-[11px] font-extrabold text-[#115e59] text-right bg-emerald-50/10 flex items-center justify-end">
                        {formatCurrency(currentQuoteSubtotal)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full" id="pdf-rows-totals">
                    <div className="w-full flex text-[10px] border-l border-r border-b border-[#09090b] bg-zinc-50/40">
                      <div className="w-[10%]"></div>
                      <div className="w-[55%]"></div>
                      <div className="w-[17%] text-[#0A2E5C] pr-4 font-black uppercase tracking-wider select-none flex items-center justify-end h-9">Subtotal</div>
                      <div className="w-[18%] text-right pr-4 font-mono font-black text-[#09090b] text-[11px] border-l border-[#cbd5e1] flex items-center justify-end h-9">{formatCurrency(currentQuoteSubtotal)}</div>
                    </div>
                    {sheetDoc.details.downPayment && sheetDoc.details.downPayment > 0 ? (
                      <div className="w-full flex text-[10px] border-l border-r border-b border-[#09090b] bg-emerald-50/20" id="pdf-row-downpayment">
                        <div className="w-[10%]"></div>
                        <div className="w-[55%]"></div>
                        <div className="w-[17%] text-emerald-850 pr-4 font-bold uppercase tracking-wider select-none flex items-center justify-end h-8">Down Payment</div>
                        <div className="w-[18%] text-right pr-4 font-mono text-zinc-700 text-[10.5px] border-l border-[#cbd5e1] flex items-center justify-end h-8">{formatCurrency(sheetDoc.details.downPayment)}</div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ROW 30 & 31: Footer Spacers and Banking Info */}
                {excelStyleMode === 'excel' && (
                  <>
                    <div className="flex w-full items-stretch border-l border-b border-[#cbd5e1] h-7 bg-zinc-50/30" id="excel-row-30">
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none print:hidden">30</div>
                      <div className="flex-1 flex">
                        <div className="w-[10%] border-r border-[#cbd5e1] bg-zinc-50/10"></div>
                        <div className="w-[90%] font-black uppercase tracking-tight text-[9px] text-zinc-800 flex items-center pl-3">
                          PAYMENT DETAILS: CBZ, Southerton Branch. Acc: 27541360012
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-stretch border-l border-b border-[#cbd5e1] h-6 bg-zinc-50/10" id="excel-row-31">
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none print:hidden">31</div>
                      <div className="flex-1 flex">
                        <div className="w-[10%] border-r border-[#cbd5e1] bg-zinc-50/10"></div>
                        <div className="w-[55%] border-r border-[#cbd5e1] bg-zinc-50/5 font-mono text-[8px] text-zinc-400 flex items-center pl-3">
                          Standard spreadsheet accounting ledger guidelines are active.
                        </div>
                        <div className="w-[17%] border-r border-[#cbd5e1]"></div>
                        <div className="w-[18%]"></div>
                      </div>
                    </div>
                  </>
                )}

                {/* ROW 32: GRAND TOTAL at J32 with SUM auditing double logic */}
                {(excelStyleMode === 'excel' || sheetDoc.type !== 'QUOTE') && (
                  <div className={`flex w-full items-stretch ${excelStyleMode === 'excel' ? 'border-l border-b border-[#cbd5e1]' : 'mt-2'}`} id="excel-row-32">
                    {excelStyleMode === 'excel' && (
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-2 print:hidden">
                        32
                      </div>
                    )}
                    <div className="flex-1 flex items-stretch min-w-0">
                      {excelStyleMode === 'excel' ? (
                        <>
                          <div className="w-[10%] border-r border-b border-[#cbd5e1] bg-[#f1f5f9]"></div>
                          <div className="w-[55%] border-r border-b border-[#cbd5e1] px-3 py-1 flex items-center gap-2 bg-indigo-50/10">
                            <span className="text-[7.5px] font-black font-mono bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded tracking-wide uppercase select-none print:hidden">FORMULA J32</span>
                            <span className="text-[10px] font-mono font-bold text-indigo-650 block select-none">
                              =SUM(J15:J29)/2 <span className="font-sans font-normal text-zinc-400 text-[9px] ml-1">(Bypasses double evaluation counting error)</span>
                            </span>
                          </div>
                          <div className="w-[17%] border-r border-b border-[#cbd5e1] px-3 py-1 font-bold text-[9px] text-slate-800 text-right flex items-center justify-end uppercase bg-zinc-100 font-mono">
                            GRAND TOTAL (J32)
                          </div>
                          <div className="w-[18%] border-b-2 border-double border-[#0f172a] bg-zinc-100/50 px-3 py-1 font-mono text-[13px] font-black text-slate-900 text-right underline decoration-double flex items-center justify-end" id="cell-j32">
                            {formatCurrency(grandTotalResult)}
                          </div>
                        </>
                      ) : (
                        <div className={`w-full flex text-right ${isVeryCrowded ? 'mt-1.5 mb-1' : isCrowded ? 'mt-3 mb-2' : 'mt-6 mb-4'}`}>
                          <div className="w-[10%]"></div>
                          <div className="w-[55%]"></div>
                          <div className="w-[17%] text-right pr-4 font-black text-zinc-900 uppercase tracking-widest flex items-center justify-end text-[12px] select-none">
                            {sheetDoc.details.downPayment && sheetDoc.details.downPayment > 0 ? "BALANCE DUE" : "TOTAL DUE"}
                          </div>
                          <div className="w-[18%] text-right pr-2 font-mono text-2xl font-black text-zinc-955 underline decoration-double select-all" id="cell-j32">
                            {formatCurrency(
                              sheetDoc.details.downPayment && sheetDoc.details.downPayment > 0 
                                ? (grandTotalResult - sheetDoc.details.downPayment) 
                                : grandTotalResult
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {excelStyleMode === 'excel' && sheetDoc.details.downPayment && sheetDoc.details.downPayment > 0 ? (
                  <>
                    {/* Row 32B: DOWN PAYMENT */}
                    <div className="flex w-full items-stretch border-l border-b border-[#cbd5e1]" id="excel-row-32b">
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-1.5 print:hidden">
                        32B
                      </div>
                      <div className="flex-1 flex items-stretch min-w-0">
                        <div className="w-[10%] border-r border-b border-[#cbd5e1] bg-[#f1f5f9]"></div>
                        <div className="w-[55%] border-r border-b border-[#cbd5e1] px-3 py-1 flex items-center font-mono text-zinc-400 text-[9px] select-none">
                          DOWN PAYMENT / PART PAYMENT MADE
                        </div>
                        <div className="w-[17%] border-r border-b border-[#cbd5e1] px-3 py-1 font-bold text-[9px] text-slate-500 text-right flex items-center justify-end uppercase bg-zinc-100 font-mono">
                          DOWN PAYMENT
                        </div>
                        <div className="w-[18%] border-b border-[#cbd5e1] bg-emerald-50/20 px-3 py-1 font-mono text-[11px] font-bold text-slate-700 text-right flex items-center justify-end">
                          {formatCurrency(sheetDoc.details.downPayment)}
                        </div>
                      </div>
                    </div>

                    {/* Row 32C: BALANCE OUTSTANDING */}
                    <div className="flex w-full items-stretch border-l border-b border-[#cbd5e1]" id="excel-row-32c">
                      <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-1.5 print:hidden">
                        32C
                      </div>
                      <div className="flex-1 flex items-stretch min-w-0">
                        <div className="w-[10%] border-r border-b border-[#cbd5e1] bg-[#f1f5f9]"></div>
                        <div className="w-[55%] border-r border-b border-[#cbd5e1] px-3 py-1 flex items-center font-mono text-indigo-650 text-[9px] select-none">
                          =J32-J33 <span className="font-sans font-normal text-zinc-400 text-[8px] ml-1">(Grand Total minus Down Payment)</span>
                        </div>
                        <div className="w-[17%] border-r border-b border-[#cbd5e1] px-3 py-1 font-black text-[9px] text-[#0A2E5C] text-right flex items-center justify-end uppercase bg-zinc-100 font-mono">
                          BALANCE DUE
                        </div>
                        <div className="w-[18%] border-b-2 border-double border-[#0f172a] bg-teal-50/10 px-3 py-1 font-mono text-[12px] font-black text-teal-950 text-right flex items-center justify-end">
                          {formatCurrency(grandTotalResult - sheetDoc.details.downPayment)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {/* ROW 33 to 35: Footer notes and signature spaces */}
                <div className={`flex w-full items-stretch ${excelStyleMode === 'excel' ? 'border-l border-b border-[#cbd5e1]' : isVeryCrowded ? 'mt-2 pt-2 border-t border-dashed border-[#e4e4e7]' : isCrowded ? 'mt-4 pt-4 border-t border-dashed border-[#e4e4e7]' : 'mt-8 pt-6 border-t border-dashed border-[#e4e4e7]'}`} id="excel-row-33">
                  {excelStyleMode === 'excel' && (
                    <div className="w-8 flex-shrink-0 bg-[#f8f9fa] border-r border-b border-[#cbd5e1] font-mono text-[9px] text-zinc-500 flex items-center justify-center font-bold select-none py-1 print:hidden">
                      33
                    </div>
                  )}
                  <div className="flex-1 flex items-stretch min-w-0">
                    {excelStyleMode === 'excel' ? (
                      <>
                        <div className="w-[10%] border-r border-[#cbd5e1]"></div>
                        <div className="w-[90%] px-3 py-1 text-[8px] font-mono text-zinc-400 uppercase tracking-wide flex items-center">
                          A4 PRINT LAYOUT BOUND • BORDER STYLING APPLIES ACC ACCOUNTING PLACEMENTS
                        </div>
                      </>
                    ) : (
                      <div className={`w-full flex flex-col transition-all duration-300 ${isVeryCrowded ? 'pt-1.5' : 'pt-4'}`}>
                        {sheetDoc.type !== 'QUOTE' ? (
                          /* INVOICE VIEW: COMBINED AS IN SCREENSHOT WITH PAYMENT, COMMENTS, TAX RATES, GRAND TOTAL AND BANKING DETAILS BOX */
                          <div className="flex flex-col w-full text-left font-sans select-text">
                            {/* Upper section side-by-side grid */}
                            <div className="grid grid-cols-12 gap-6 items-stretch w-full">
                              {/* Left Columns (col-span-7): Payment & Comments info */}
                              <div className="col-span-7 flex flex-col">
                                {/* Payment Row */}
                                <div className={`flex items-stretch w-full ${isVeryCrowded ? 'mb-1.5' : 'mb-3'}`}>
                                  <div className="w-24 pb-0.5 border-b-[2.5px] border-[#09090b] font-black text-[12px] text-zinc-950 uppercase tracking-wider flex items-end">
                                    Payment:
                                  </div>
                                  <div className={`flex-1 border-t-[2.5px] border-l-[2.5px] border-r-[2.5px] border-[#09090b] px-4 text-zinc-950 font-black text-[11.5px] bg-white h-7 flex items-center ${isVeryCrowded ? 'py-0.5' : 'py-1'}`}>
                                    Cash
                                  </div>
                                </div>

                                {/* Comments block with solid right border representing excel boundary */}
                                <div className="flex-1 border-r-[2.5px] border-[#09090b] flex flex-col pr-6 pt-1">
                                  <span className="font-black text-[12px] text-zinc-950 uppercase tracking-wider mb-1">
                                    Comments:
                                  </span>
                                  <div className={`flex flex-col pl-6 w-full ${isVeryCrowded ? 'gap-2' : 'gap-3.5'}`}>
                                    <div className="border-b-[1.5px] border-[#09090b] pb-0.5 text-[11px] font-black text-zinc-950 tracking-wide italic">
                                      Amounts are in United States
                                    </div>
                                    <div className="border-b-[1.5px] border-[#09090b]" style={{ height: isVeryCrowded ? '12px' : '20px' }}></div>
                                    <div className="border-b-[1.5px] border-[#09090b]" style={{ height: isVeryCrowded ? '12px' : '20px' }}></div>
                                  </div>
                                </div>
                               {/* Right Columns (col-span-5): Tax Rates, Grand Total & Thank you box */}
                              <div className="col-span-5 flex flex-col justify-between pt-1">
                                {/* Tax Rates */}
                                <div className={`flex justify-end items-center gap-4 ${isVeryCrowded ? 'mb-2' : 'mb-3.5'}`}>
                                  <span className="font-extrabold text-[10.5px] text-zinc-955 uppercase tracking-wider">
                                    Tax Rate(s)
                                  </span>
                                  <div className="grid grid-cols-2 border-[1.5px] border-[#a1a1aa] bg-zinc-100">
                                    <div className="border-r border-b border-[#a1a1aa] w-12 h-4 bg-zinc-100"></div>
                                    <div className="border-b border-[#a1a1aa] w-12 h-4 bg-zinc-100"></div>
                                    <div className="border-r border-[#a1a1aa] w-12 h-4 bg-zinc-100"></div>
                                    <div className="w-12 h-4 bg-zinc-100"></div>
                                  </div>
                                </div>

                                {/* Light cyan Thank you banner */}
                                <div className={`w-full text-center bg-[#CCFFFA]/30 border-[1.5px] border-[#09090b] rounded-none font-sans font-black text-zinc-950 text-[12px] tracking-widest uppercase select-none shadow-3xs ${isVeryCrowded ? 'py-1.5' : 'py-3'}`}>
                                  Thank you.
                                </div>                               </div>
                              </div>
                            </div>

                            {/* Wide enclosed Banking and Payment details box */}
                            <div className={`w-full border-[1.5px] border-[#09090b] bg-white text-center shadow-3xs transition-all duration-300 ${bankDetailsPaddingClass}`}>
                              <p className="font-semibold italic text-[11px] text-zinc-900 select-text leading-relaxed">
                                Please kindly make payment in <span className="font-black uppercase">CASH</span> or <span className="font-black uppercase">Bank Transfer</span> to:
                              </p>
                              <p className="font-black italic text-[11.5px] text-zinc-955 font-sans mt-1.5 select-text tracking-wide">
                                Parkvan Calibration: CBZ, Southerton Branch. Acc. # 27541360012
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* QUOTATION VIEW: SIMPLE AND ELEGANT COMMENT AND YELLOW THANK YOU BANNER */
                          <div className="flex flex-col w-full text-left font-sans mt-3 select-text">
                            <span className="text-[12px] font-extrabold text-zinc-950 tracking-wide uppercase select-none mb-1">
                              {displayComments.length > 1 ? 'Comments:' : 'Comment:'}
                            </span>
                            <div className={`flex flex-col ${isUltraCrowded ? 'gap-0.5' : isVeryCrowded ? 'gap-1' : 'gap-1.5'} pl-1 mb-2`}>
                              {displayComments.map((comment, index) => (
                                <p 
                                  key={index} 
                                  className={`${
                                    isUltraCrowded 
                                      ? 'text-[10.5px] leading-tight' 
                                      : isVeryCrowded 
                                        ? 'text-[11px] leading-snug' 
                                        : 'text-[12.5px] leading-relaxed'
                                  } ${
                                    displayComments.length > 1 
                                      ? 'font-normal text-zinc-700' 
                                      : 'font-bold text-zinc-850'
                                  } max-w-full flex items-start gap-1`}
                                >
                                  <span className="text-zinc-955 font-black shrink-0">•</span>
                                  <span className="text-zinc-900">{comment}</span>
                                </p>
                              ))}
                            </div>
                            <div className={`w-[70%] mx-auto text-center bg-[#FEFAEB] border-[1.5px] border-[#fcd34d] py-2 rounded-none text-[12px] font-black text-amber-950 uppercase tracking-widest select-none shadow-3xs transition-all duration-300 ${thankYouMarginClass}`}>
                              Thank You
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {excelStyleMode === 'clean' && (
                  <div className="w-full mt-auto">
                    {/* Page Border Solid Blue Line Spacer */}
                    <div className={`w-full h-[3.5px] bg-[#0A2E5C] select-none transition-all duration-300 ${pageBorderLineMtClass}`}></div>

                    {/* Footer Contact Slogans Row */}
                    <div className="w-full flex flex-row flex-nowrap justify-between items-center text-[9px] sm:text-[10px] font-sans font-semibold select-none text-zinc-650 gap-2 whitespace-nowrap pt-2.5 pb-1">
                      <span className="text-[#E65100] font-black uppercase tracking-wider text-[9.5px] sm:text-[10.5px] shrink-0 whitespace-nowrap">
                        {brCompanyFooterTagline}
                      </span>
                      
                      <span className="font-mono font-bold select-text shrink-0 whitespace-nowrap">
                        {brCompanyEmail || 'sales@parkvancalibration.co.zw'}
                      </span>

                      <div className="flex items-center gap-2 sm:gap-4 font-mono font-bold shrink-0 whitespace-nowrap">
                        <span className="select-text">{brCompanyPhone || '+263 77 241 3600'}</span>
                        <span className="text-zinc-400 font-bold">Page 1 of 1</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Securely render custom rebranded footer inside canvas during high-fidelity PDF capture only */}
                {isGeneratingPDF && (
                  <div className="absolute bottom-2.5 left-6 font-sans text-[8px] font-semibold text-zinc-400 select-all lowercase tracking-wider">
                    https://parkvan-calibration.co.zw/
                  </div>
                )}

              </div>

            </div>

          </div>

          <div className="custom-print-url-footer">
            https://parkvan-calibration.co.zw/
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-1 print:hidden">
            <span className="font-bold text-white block">💡 Dynamic Simulation Mechanics:</span>
            <p className="text-slate-400">
              Select <strong>"2. Finalize Invoice"</strong>, input any Order Identifier number (simulating VBA prompt Box), and watch the system instantly pull active lines, resolve metadata parameters, and perform the proper sheet range division sum arithmetic!
            </p>
          </div>

        </section>

      </main>

      <footer className="bg-slate-900/60 border-t border-slate-800/80 p-4 text-center text-xs text-slate-500 mt-20 font-mono print:hidden">
        Quotation & Invoicing Studio • Simulated Desktop Environment
      </footer>

    </div>
  );
}
