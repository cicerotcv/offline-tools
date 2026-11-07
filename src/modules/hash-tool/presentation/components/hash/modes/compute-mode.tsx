import {
  type Algorithm,
  type HashCase,
} from '../../../../domain/hash/algorithm';
import { type HashInputState } from '../../../hooks/hash-input';
import { CameraCaptureModal } from '../camera-capture-modal';
import { HashInputPanel } from '../hash-input-panel';
import { HashOutputSection } from '../hash-output-section';

interface ComputeModeProps {
  algorithm: Algorithm;
  hashCase: HashCase;
  onHashCaseChange: (hashCase: HashCase) => void;
  input: HashInputState;
}

export function ComputeMode({
  algorithm,
  hashCase,
  onHashCaseChange,
  input,
}: ComputeModeProps) {
  return (
    <>
      <HashInputPanel input={input} />

      <HashOutputSection
        hash={input.hash}
        algorithm={algorithm}
        hashCase={hashCase}
        onHashCaseChange={onHashCaseChange}
        error={input.error}
        isProcessing={input.isProcessing}
        inputLabel={input.inputLabel}
        imagePreview={input.inputMode === 'camera' ? input.imagePreview : null}
      />

      <CameraCaptureModal
        open={input.cameraModalOpen}
        onOpenChange={input.setCameraModalOpen}
        onCapture={input.handleCameraCapture}
        disabled={input.isProcessing}
      />
    </>
  );
}
