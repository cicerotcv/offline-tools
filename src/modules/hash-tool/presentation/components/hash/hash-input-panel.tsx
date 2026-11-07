import { FileDropZone } from '@/shared/presentation/components/file-drop-zone';

import { Button } from '$/components/ui/button';
import { FormSection } from '$/components/ui/form-section';

import { type HashInputState } from '../../hooks/hash-input';
import { InputModeTabs } from './input-mode-tabs';
import { TextInputSection } from './text-input-section';

interface HashInputPanelProps {
  input: HashInputState;
}

export function HashInputPanel({ input }: HashInputPanelProps) {
  return (
    <FormSection
      title="Input"
      action={
        input.hasInput && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={input.handleClearAll}
            disabled={input.isProcessing}
          >
            Clear
          </Button>
        )
      }
    >
      <InputModeTabs
        inputMode={input.inputMode}
        onInputModeChange={input.setInputMode}
        disabled={input.isProcessing}
      />

      {input.inputMode === 'text' && (
        <TextInputSection
          value={input.textInput}
          onChange={input.setTextInput}
          disabled={input.isProcessing}
        />
      )}

      {input.inputMode === 'file' && (
        <FileDropZone
          onFileSelect={input.handleFileSelect}
          selectedFile={input.fileInput}
          disabled={input.isProcessing}
        />
      )}

      {input.inputMode === 'camera' && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Take a photo to fingerprint its PNG bytes, for example a printed
            document.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => input.setCameraModalOpen(true)}
            disabled={input.isProcessing}
          >
            {input.imagePreview ? 'Take another photo' : 'Open camera'}
          </Button>
        </div>
      )}
    </FormSection>
  );
}
