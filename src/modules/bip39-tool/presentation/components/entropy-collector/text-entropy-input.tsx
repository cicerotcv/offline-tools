import { useState } from 'react';

import { Shuffle } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Label } from '$/components/ui/label';
import { SecretTextarea } from '$/components/ui/secret-field';

interface TextEntropyInputProps {
  onCollect: (text: string) => Promise<void>;
  isProcessing?: boolean;
  hasEntropy?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export function TextEntropyInput({
  onCollect,
  isProcessing = false,
  hasEntropy = false,
  disabled = false,
  label = 'Text',
  placeholder = 'Enter text to collect entropy from...',
}: TextEntropyInputProps) {
  const [text, setText] = useState('');

  const handleCollect = async () => {
    if (!text.trim()) return;
    await onCollect(text);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label
          htmlFor="text-entropy-input"
          className="mb-2 block text-sm font-medium text-foreground/80"
        >
          {label}
        </Label>
        <SecretTextarea
          id="text-entropy-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-32"
          disabled={disabled || isProcessing}
        />
      </div>
      <Button
        type="button"
        onClick={handleCollect}
        disabled={disabled || isProcessing || !text.trim()}
        className="w-full"
        size="lg"
      >
        <Shuffle className="mr-2 h-4 w-4" />
        {isProcessing ? 'Processing...' : 'Collect from text'}
      </Button>
      {hasEntropy && (
        <Alert variant="success" className="p-2">
          ✓ Text entropy collected (32 bytes)
        </Alert>
      )}
    </div>
  );
}
