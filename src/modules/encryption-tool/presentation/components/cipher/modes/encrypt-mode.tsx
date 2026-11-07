import { useState } from 'react';

import { Lock } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';
import { downloadText } from '$/lib/download';

import { useMessageCipher } from '../../../hooks/message-cipher';
import { FileInputSection } from '../file-input-section';
import { InputModeTabs } from '../input-mode-tabs';
import { KeyInputSection } from '../key-input-section';
import { OutputSection } from '../output-section';
import { TextInputSection } from '../text-input-section';

type InputMode = 'text' | 'file';

export function EncryptMode() {
  const { encryptMessage } = useMessageCipher();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!password) {
      setError('Enter a password.');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      // Get input data
      let inputData: string | Uint8Array;
      let filename: string | undefined;

      if (inputMode === 'text') {
        if (!textInput.trim()) {
          setError('Enter the text to encrypt.');
          setIsProcessing(false);
          return;
        }
        inputData = textInput;
      } else {
        if (!fileInput) {
          setError('Choose a file to encrypt.');
          setIsProcessing(false);
          return;
        }
        inputData = new Uint8Array(await fileInput.arrayBuffer());
        filename = fileInput.name;
      }

      // Encrypt
      const encrypted = await encryptMessage.execute({
        data: inputData,
        password,
        filename,
      });

      if (inputMode === 'file') {
        const name = fileInput?.name
          ? `${fileInput.name}.gpg`
          : 'encrypted.gpg';
        downloadText(name, encrypted);
        setOutput(`Encrypted and saved as ${name}.`);
      } else {
        setOutput(encrypted);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during encryption'
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
    if (output) downloadText('message.asc', output);
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
            operationMode="encrypt"
            disabled={isProcessing}
          />
        ) : (
          <FileInputSection
            selectedFile={fileInput}
            onFileSelect={handleFileSelect}
            operationMode="encrypt"
            disabled={isProcessing}
          />
        )}
      </FormSection>

      <KeyInputSection
        value={password}
        onChange={setPassword}
        operationMode="encrypt"
        disabled={isProcessing}
      />

      <Button
        onClick={handleEncrypt}
        disabled={isProcessing || !password}
        className="w-full"
        size="lg"
      >
        <Lock aria-hidden className="h-4 w-4" />
        {isProcessing ? 'Encrypting…' : 'Encrypt'}
      </Button>

      {error && <Alert variant="error">{error}</Alert>}

      {inputMode === 'text' && (
        <OutputSection
          output={output}
          operationMode="encrypt"
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
