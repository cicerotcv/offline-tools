import { FileDropZone } from '@/shared/presentation/components/file-drop-zone';

interface FileInputSectionProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  operationMode: 'encrypt' | 'decrypt';
  disabled?: boolean;
}

export function FileInputSection({
  selectedFile,
  onFileSelect,
  operationMode,
  disabled = false,
}: FileInputSectionProps) {
  return (
    <div className="space-y-1.5">
      <FileDropZone
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        {operationMode === 'encrypt'
          ? 'The encrypted copy (.gpg) is saved right after encrypting.'
          : 'Choose a .gpg or .asc file; the original file is saved after decrypting.'}
      </p>
    </div>
  );
}
