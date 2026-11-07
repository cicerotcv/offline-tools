import { useCallback, useState } from 'react';

import { File, Upload, X } from 'lucide-react';

import { Button } from '$/components/ui/button';
import { cn } from '$/lib/utils';

interface FileDropZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
  dropZoneClassName?: string;
  accept?: string;
}

export function FileDropZone({
  onFileSelect,
  selectedFile,
  disabled = false,
  className,
  dropZoneClassName,
  accept,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onFileSelect(null);
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-all',
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-foreground/20 bg-muted/50',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <input
        type="file"
        onChange={handleFileInput}
        className="hidden"
        id="file-drop-zone-input"
        disabled={disabled}
        accept={accept}
        value=""
      />

      {selectedFile ? (
        <div className={cn('p-6', dropZoneClassName)}>
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center
                rounded-lg bg-primary/20"
            >
              <File className="h-6 w-6 text-accent-strong" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="h-6 w-6 shrink-0 p-0"
                  title="Remove file"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <label
            htmlFor="file-drop-zone-input"
            className="mt-4 block"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="w-full"
              asChild
              type="button"
            >
              <span>Choose another file</span>
            </Button>
          </label>
        </div>
      ) : (
        <label
          htmlFor="file-drop-zone-input"
          className={cn(
            `flex cursor-pointer flex-col items-center justify-center p-8
              text-center`,
            dropZoneClassName
          )}
        >
          <div
            className={cn(
              `mb-4 flex h-16 w-16 items-center justify-center rounded-full
                transition-colors`,
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-accent-strong' : 'text-muted-foreground'
              )}
            />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground/80">
            {isDragging ? 'Drop file here' : 'Drag and drop a file here'}
          </p>
          <p className="text-xs text-muted-foreground">
            or <span className="font-medium text-accent-strong">browse</span> to
            choose a file
          </p>
        </label>
      )}
    </div>
  );
}
