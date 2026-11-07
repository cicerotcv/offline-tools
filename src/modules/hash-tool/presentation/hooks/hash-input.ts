import { useEffect, useMemo, useState } from 'react';

import { type Algorithm } from '../../domain/hash/algorithm';
import { type InputMode } from '../../domain/hash/input-mode';
import { useHashContent } from './hash-content';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useHashInput(algorithm: Algorithm) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  const content =
    inputMode === 'text'
      ? textInput
      : inputMode === 'file'
        ? fileInput
        : inputMode === 'camera'
          ? capturedBlob
          : null;

  const { hash, isProcessing, error } = useHashContent({
    content,
    algorithm,
    debounceDelay: 300,
    enabled: true,
  });

  const inputLabel = useMemo(() => {
    if (inputMode === 'text' && textInput.trim()) {
      const bytes = new TextEncoder().encode(textInput).byteLength;
      return `Input: ${textInput.length} characters · ${formatFileSize(bytes)} UTF-8`;
    }

    if (inputMode === 'file' && fileInput) {
      return `Input: ${fileInput.name} · ${formatFileSize(fileInput.size)}`;
    }

    if (inputMode === 'camera' && capturedBlob) {
      return `Input: captured image · ${formatFileSize(capturedBlob.size)}`;
    }

    return undefined;
  }, [inputMode, textInput, fileInput, capturedBlob]);

  const hasInput =
    Boolean(textInput.trim()) || Boolean(fileInput) || Boolean(capturedBlob);

  const handleFileSelect = (file: File | null) => {
    setFileInput(file);
    if (file && imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setCapturedBlob(null);
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    setCapturedBlob(blob);
    const previewUrl = URL.createObjectURL(blob);
    setImagePreview(previewUrl);
  };

  const handleClearText = () => {
    setTextInput('');
  };

  const handleClearAll = () => {
    setTextInput('');
    setFileInput(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setCapturedBlob(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (inputMode !== 'camera' && imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setCapturedBlob(null);
    }
  }, [inputMode, imagePreview]);

  useEffect(() => {
    if (inputMode === 'text' && imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setCapturedBlob(null);
    }
  }, [textInput, inputMode, imagePreview]);

  return {
    inputMode,
    setInputMode,
    textInput,
    setTextInput,
    fileInput,
    cameraModalOpen,
    setCameraModalOpen,
    imagePreview,
    hash,
    isProcessing,
    error,
    inputLabel,
    hasInput,
    handleFileSelect,
    handleCameraCapture,
    handleClearText,
    handleClearAll,
  };
}

export type HashInputState = ReturnType<typeof useHashInput>;
