import { useState } from 'react';

import { Unlock } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { downloadBlob, downloadText } from '$/lib/download';

import { useMessageCipher } from '../../../hooks/message-cipher';
import { FileInputSection } from '../file-input-section';
import { InputModeTabs } from '../input-mode-tabs';
import { KeyInputSection } from '../key-input-section';
import { OutputSection } from '../output-section';
import { TextInputSection } from '../text-input-section';

type InputMode = 'text' | 'file';

export function DecryptMode() {
  const { decryptMessage } = useMessageCipher();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!password) {
      setError('Enter the password.');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      let encryptedData: string;

      if (inputMode === 'text') {
        if (!textInput.trim()) {
          setError('Paste the encrypted message.');
          setIsProcessing(false);
          return;
        }
        encryptedData = textInput.trim();
      } else {
        if (!fileInput) {
          setError('Choose the encrypted file.');
          setIsProcessing(false);
          return;
        }
        encryptedData = await fileInput.text();
      }

      // Decrypt
      const { data, filename } = await decryptMessage.execute({
        armoredMessage: encryptedData,
        password,
      });

      // Text mode: show the bytes only if they are valid UTF-8.
      if (inputMode === 'text') {
        try {
          setOutput(new TextDecoder('utf-8', { fatal: true }).decode(data));
        } catch {
          setError(
            'The decrypted data is binary, not text. Use the File tab to save it.'
          );
          setOutput('');
        }
      } else {
        const downloadName =
          filename ||
          fileInput?.name
            .replace(/\.(gpg|asc)$/, '')
            .replace(/\.encrypted$/, '') ||
          'decrypted';
        downloadBlob(downloadName, new Blob([data as BlobPart]));
        setOutput(`Decrypted and saved as ${downloadName}.`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during decryption'
      );
      setOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFileInput(file);
    if (!file) {
      setOutput('');
    }
  };

  const handleDownload = () => {
    if (output) downloadText('decrypted.txt', output);
  };

  return (
    <div className="space-y-6">
      <FormSection title="Input">
        <InputModeTabs
          inputMode={inputMode}
          onInputModeChange={setInputMode}
          disabled={isProcessing}
        />
        {inputMode === 'text' ? (
          <TextInputSection
            value={textInput}
            onChange={setTextInput}
            operationMode="decrypt"
            disabled={isProcessing}
          />
        ) : (
          <FileInputSection
            selectedFile={fileInput}
            onFileSelect={handleFileSelect}
            operationMode="decrypt"
            disabled={isProcessing}
          />
        )}
      </FormSection>

      <KeyInputSection
        value={password}
        onChange={setPassword}
        operationMode="decrypt"
        disabled={isProcessing}
      />

      <Button
        onClick={handleDecrypt}
        disabled={isProcessing || !password}
        className="w-full"
        size="lg"
      >
        <Unlock aria-hidden className="h-4 w-4" />
        {isProcessing ? 'Decrypting…' : 'Decrypt'}
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      {inputMode === 'text' && (
        <OutputSection
          output={output}
          operationMode="decrypt"
          isProcessing={isProcessing}
          onDownload={handleDownload}
        />
      )}
      {inputMode === 'file' && output && (
        <Alert variant="success">{output}</Alert>
      )}
    </div>
  );
}
