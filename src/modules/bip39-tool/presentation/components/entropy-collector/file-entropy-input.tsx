import { useState } from 'react';

import { Shuffle } from 'lucide-react';

import { FileDropZone } from '@/shared/presentation/components/file-drop-zone';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Label } from '$/components/ui/label';

interface FileEntropyInputProps {
  onCollect: (file: File) => Promise<void>;
  isProcessing?: boolean;
  hasEntropy?: boolean;
  disabled?: boolean;
  label?: string;
}

export function FileEntropyInput({
  onCollect,
  isProcessing = false,
  hasEntropy = false,
  disabled = false,
  label = 'File',
}: FileEntropyInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleCollect = async () => {
    if (!selectedFile) return;
    await onCollect(selectedFile);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block text-sm font-medium text-foreground/80">
          {label}
        </Label>
        <FileDropZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          disabled={disabled || isProcessing}
        />
      </div>
      {selectedFile && (
        <Button
          type="button"
          onClick={handleCollect}
          disabled={disabled || isProcessing}
          className="w-full"
          size="lg"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          {isProcessing ? 'Processing...' : 'Collect from file'}
        </Button>
      )}
      {hasEntropy && (
        <Alert variant="success" className="p-2">
          ✓ File entropy collected (32 bytes)
        </Alert>
      )}
    </div>
  );
}
