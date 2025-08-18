import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  FileImage,
  File,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Invoice {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  size: number;
  type: string;
  amount?: number;
  vendor?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload images (JPEG, PNG, GIF) or PDF files only.",
        });
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
        });
        return;
      }

      const newInvoice: Invoice = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
        uploadDate: new Date(),
        size: file.size,
        type: file.type,
      };

      setInvoices(prev => [...prev, newInvoice]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const url = URL.createObjectURL(invoice.file);
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedInvoice(null);
    setPreviewUrl(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    if (selectedInvoice?.id === invoiceId) {
      handleClosePreview();
    }
    toast({
      title: "Invoice deleted",
      description: "Invoice has been removed successfully.",
    });
  };

  const handleDownloadOriginal = (invoice: Invoice) => {
    const url = URL.createObjectURL(invoice.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = invoice.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAsPDF = async (invoice: Invoice) => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.name.replace(/\.[^/.]+$/, "")}.pdf`);
      
      toast({
        title: "PDF downloaded",
        description: "Invoice has been converted to PDF and downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to convert invoice to PDF.",
      });
    }
  };

  const handleDownloadAsImage = async (invoice: Invoice) => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${invoice.name.replace(/\.[^/.]+$/, "")}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image downloaded",
            description: "Invoice has been downloaded as PNG image.",
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to convert invoice to image.",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type === 'application/pdf') return File;
    return FileText;
  };

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Invoice Viewer</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Upload, view, and manage your invoices and receipts</p>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Upload size={16} className="mr-2" />
            Upload Invoice
          </Button>
        </div>

        {/* Summary Card */}
        <div className="mt-4">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                  <p className="text-2xl lg:text-3xl font-bold text-teal-600">{invoices.length}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(invoices.reduce((sum, inv) => sum + inv.size, 0))} total size
                  </p>
                </div>
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Invoice List */}
        <div className="flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Uploaded Invoices</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <div className="h-full overflow-auto">
                {invoices.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No invoices uploaded
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upload your first invoice to get started
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Invoice
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {invoices.map((invoice) => {
                      const FileIcon = getFileIcon(invoice.type);
                      const isSelected = selectedInvoice?.id === invoice.id;
                      
                      return (
                        <div
                          key={invoice.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileIcon className="w-5 h-5 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {invoice.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {invoice.type.split('/')[1].toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(invoice.size)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {invoice.uploadDate.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewInvoice(invoice);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteInvoice(invoice.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Preview */}
        <div className="flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedInvoice ? 'Invoice Preview' : 'Select an Invoice'}
                </CardTitle>
                {selectedInvoice && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedInvoice && handleDownloadOriginal(selectedInvoice)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Original
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedInvoice && handleDownloadAsPDF(selectedInvoice)}
                    >
                      <File className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedInvoice && handleDownloadAsImage(selectedInvoice)}
                    >
                      <FileImage className="w-4 h-4 mr-1" />
                      PNG
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClosePreview}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <div className="h-full overflow-auto">
                {selectedInvoice && previewUrl ? (
                  <div ref={previewRef} className="p-4">
                    {selectedInvoice.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt={selectedInvoice.name}
                        className="max-w-full h-auto rounded-lg shadow-sm"
                      />
                    ) : selectedInvoice.type === 'application/pdf' ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-96 rounded-lg border"
                        title={selectedInvoice.name}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-center">
                          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Preview not available for this file type
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No invoice selected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Select an invoice from the list to preview it here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}