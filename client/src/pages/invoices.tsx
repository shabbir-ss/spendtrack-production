import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Invoice } from "@shared/schema";

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices from API
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/invoices');
      return response as Invoice[];
    }
  });

  // Upload invoice mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('invoice', file);
      formData.append('transactionId', 'standalone');

      const uploadResponse = await fetch('/api/upload/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      
      // Create invoice record
      const invoiceData = {
        name: uploadResult.file.originalName,
        fileName: uploadResult.file.originalName,
        filePath: uploadResult.file.path,
        fileType: uploadResult.file.mimetype,
        fileSize: uploadResult.file.size,
      };

      return await apiRequest('POST', '/invoices', invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice uploaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload invoice. Please try again.",
      });
    }
  });

  // Delete invoice mutation
  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await apiRequest('DELETE', `/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedInvoice(null);
      setPreviewUrl(null);
      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete invoice. Please try again.",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload images (JPEG, PNG, WEBP) or PDF files only.",
        });
        return;
      }

      // Check file size (50MB limit to match backend)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload files smaller than 50MB.",
        });
        return;
      }

      uploadMutation.mutate(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    // For server-stored files, construct the URL to view the file
    const filename = invoice.filePath?.split('/').pop();
    const viewUrl = `/api/files/standalone/${filename}?token=${localStorage.getItem('accessToken')}`;
    setPreviewUrl(viewUrl);
  };

  const handleClosePreview = () => {
    setSelectedInvoice(null);
    setPreviewUrl(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteMutation.mutate(invoiceId);
  };

  const handleDownloadOriginal = (invoice: Invoice) => {
    const filename = invoice.filePath?.split('/').pop();
    const downloadUrl = `/api/download/standalone/${filename}`;
    window.open(downloadUrl, '_blank');
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
            disabled={uploadMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Upload size={16} className="mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Invoice'}
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
                    {formatFileSize(invoices.reduce((sum, inv) => sum + (inv.fileSize || 0), 0))} total size
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
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <p className="text-gray-600 dark:text-gray-400">Failed to load invoices</p>
                    <Button 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
                      variant="outline"
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : invoices.length === 0 ? (
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
                      const FileIcon = getFileIcon(invoice.fileType || 'application/pdf');
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
                                    {(invoice.fileType || 'pdf').split('/')[1]?.toUpperCase() || 'PDF'}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(invoice.fileSize || 0)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(invoice.createdAt).toLocaleDateString()}
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