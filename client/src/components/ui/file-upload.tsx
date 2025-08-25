import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Upload, File, X, Eye, Download } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded?: (fileInfo: any) => void;
  transactionId?: string;
  existingFile?: {
    fileName?: string;
    filePath?: string;
    fileType?: string;
    fileSize?: number;
  } | null;
  disabled?: boolean;
}

export function FileUpload({ 
  onFileUploaded, 
  transactionId = 'temp', 
  existingFile,
  disabled = false 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(existingFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Only PDF and images (JPG, PNG, WEBP) are allowed.',
      });
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'File size must be less than 50MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('invoice', file);
      formData.append('transactionId', transactionId);

      const response = await fetch('/api/upload/invoice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const fileInfo = {
        fileName: result.file.originalName,
        filePath: result.file.path,
        fileType: result.file.mimetype,
        fileSize: result.file.size,
      };

      setUploadedFile(fileInfo);
      onFileUploaded?.(fileInfo);

      toast({
        title: 'Success',
        description: 'Invoice file uploaded successfully!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onFileUploaded?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewFile = () => {
    if (uploadedFile?.filePath && transactionId !== 'temp') {
      const filename = uploadedFile.filePath.split('/').pop();
      window.open(`/api/files/${transactionId}/${filename}`, '_blank');
    }
  };

  const handleDownloadFile = () => {
    if (uploadedFile?.filePath && transactionId !== 'temp') {
      const filename = uploadedFile.filePath.split('/').pop();
      window.open(`/api/download/${transactionId}/${filename}`, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };

  return (
    <div className="space-y-3">
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload invoice or receipt
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PDF, JPG, PNG, WEBP up to 50MB
            </p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="mt-4"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(uploadedFile.fileType)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadedFile.fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {uploadedFile.fileSize ? formatFileSize(uploadedFile.fileSize) : 'Unknown size'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {transactionId !== 'temp' && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleViewFile}
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadFile}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled}
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}