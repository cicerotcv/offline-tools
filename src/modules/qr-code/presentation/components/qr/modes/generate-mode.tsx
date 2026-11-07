import { useCallback, useEffect, useState } from 'react';

import Color from 'color';
import { Download } from 'lucide-react';

import { renderQrDataUrl } from '@/shared/lib/qr';
import { ColorPicker } from '@/shared/presentation/components/color-picker';
import { useDebounceState } from '@/shared/presentation/hooks/debounce-state';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { AdvancedOptions } from '$/components/ui/disclosure';
import { FormSection } from '$/components/ui/form-section';
import { Input } from '$/components/ui/input';
import { Label } from '$/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '$/components/ui/select';
import { Textarea } from '$/components/ui/textarea';

import { QRCodeConfig } from '../../../../domain/qr/qr-config';
import { QRCodeDisplay } from '../qr-code-display';

const DEFAULT_CONFIG: QRCodeConfig = {
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 256,
  colorDark: '#000000',
  colorLight: '#FFFFFF',
};

export function GenerateMode() {
  const [input, setInput, debouncedInput] = useDebounceState('', 300);
  const [config, setConfig] = useState<QRCodeConfig>(DEFAULT_CONFIG);
  const [debouncedConfig, setDebouncedConfig] = useState<QRCodeConfig>(config);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Debounce config changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedConfig(config);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [config]);

  // Generate QR code when debounced input or config changes
  useEffect(() => {
    let cancelled = false;

    if (!debouncedInput.trim()) {
      // Clear QR code when input is empty
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          setQrDataUrl(null);
          setRenderError(null);
        }
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    }

    renderQrDataUrl(debouncedInput, {
      errorCorrectionLevel: debouncedConfig.errorCorrectionLevel,
      margin: debouncedConfig.margin,
      width: debouncedConfig.width,
      dark: debouncedConfig.colorDark,
      light: debouncedConfig.colorLight,
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setRenderError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
          setRenderError(
            'This text is too long for a QR code. Shorten it or lower the error correction.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedInput, debouncedConfig]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrDataUrl;
    link.click();
  };

  const handleRestoreDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleColorDarkChange = useCallback(
    (rgba: [number, number, number, number]) => {
      const hex = Color.rgb(rgba[0], rgba[1], rgba[2]).hex();
      setConfig((prev) => {
        // Only update if the color actually changed
        if (prev.colorDark === hex) {
          return prev;
        }
        return {
          ...prev,
          colorDark: hex,
        };
      });
    },
    []
  );

  const handleColorLightChange = useCallback(
    (rgba: [number, number, number, number]) => {
      const hex = Color.rgb(rgba[0], rgba[1], rgba[2]).hex();
      setConfig((prev) => {
        // Only update if the color actually changed
        if (prev.colorLight === hex) {
          return prev;
        }
        return {
          ...prev,
          colorLight: hex,
        };
      });
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection title="Text" htmlFor="qr-input">
          <Textarea
            id="qr-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="An address, a public key, a checksum or a link."
            className="min-h-40 font-mono text-sm"
          />
        </FormSection>

        <FormSection
          title="QR code"
          action={
            qrDataUrl && (
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download aria-hidden className="h-4 w-4" />
                Download PNG
              </Button>
            )
          }
        >
          {renderError ? (
            <Alert variant="error">{renderError}</Alert>
          ) : (
            <QRCodeDisplay qrDataUrl={qrDataUrl} />
          )}
        </FormSection>
      </div>

      <AdvancedOptions>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="error-correction" className="text-sm">
              Error correction
            </Label>
            <Select
              value={config.errorCorrectionLevel}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  errorCorrectionLevel:
                    value as QRCodeConfig['errorCorrectionLevel'],
                }))
              }
            >
              <SelectTrigger id="error-correction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low, about 7%</SelectItem>
                <SelectItem value="M">Medium, about 15%</SelectItem>
                <SelectItem value="Q">Quartile, about 25%</SelectItem>
                <SelectItem value="H">High, about 30%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm">
              Size in pixels
            </Label>
            <Input
              id="size"
              type="number"
              min="100"
              max="1000"
              step="50"
              value={config.width}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  width: parseInt(e.target.value, 10) || 256,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin" className="text-sm">
              Margin in modules
            </Label>
            <Input
              id="margin"
              type="number"
              min="0"
              max="10"
              value={config.margin}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  margin: parseInt(e.target.value, 10) || 4,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Black on white scans best; keep strong contrast if you change the
            colors.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="color-dark" className="text-sm">
                Dark color
              </Label>
              <ColorPicker
                id="color-dark"
                value={config.colorDark}
                onChange={handleColorDarkChange}
                className="max-w-sm rounded-md border bg-background p-4
                  shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-light" className="text-sm">
                Light color
              </Label>
              <ColorPicker
                id="color-light"
                value={config.colorLight}
                onChange={handleColorLightChange}
                className="max-w-sm rounded-md border bg-background p-4
                  shadow-sm"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleRestoreDefaults} variant="ghost" size="sm">
          Restore defaults
        </Button>
      </AdvancedOptions>
    </div>
  );
}
