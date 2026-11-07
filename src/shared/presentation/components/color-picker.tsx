import { useCallback, useRef } from 'react';

import Color from 'color';

import { Button } from '$/components/ui/button';
import {
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
  ColorPicker as ShadcnColorPicker,
  type ColorPickerProps as ShadcnColorPickerProps,
} from '$/components/ui/color-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '$/components/ui/popover';

interface ColorPickerProps {
  value?: ShadcnColorPickerProps['value'];
  defaultValue?: ShadcnColorPickerProps['defaultValue'];
  onChange?: (rgba: [number, number, number, number]) => void;
  className?: string;
  id?: string;
}

export function ColorPicker({
  value,
  defaultValue,
  onChange,
  id,
}: ColorPickerProps) {
  const mountedRef = useRef(false);

  const handleColorChange = useCallback(
    (rgba: unknown) => {
      if (!Array.isArray(rgba) || rgba.length < 3) return;

      // Skip the first onChange call (initial mount)
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }

      if (onChange) {
        onChange(rgba as [number, number, number, number]);
      }
    },
    [onChange]
  );

  const displayValue = value || defaultValue || '#000000';
  const hexValue =
    typeof displayValue === 'string'
      ? displayValue
      : Color.rgb(displayValue as Parameters<typeof Color.rgb>[0]).hex();

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          mountedRef.current = false;
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className="h-10 w-full justify-start gap-2 bg-input"
        >
          <div
            className="h-4 w-4 rounded border border-foreground/20"
            style={{ backgroundColor: hexValue }}
          />
          <span className="font-mono text-sm">{hexValue}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4" align="start" side="bottom">
        <ShadcnColorPicker
          value={value}
          defaultValue={defaultValue}
          onChange={handleColorChange}
          className="bg-transparent"
        >
          <ColorPickerSelection className="min-h-64" />
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat />
          </div>
        </ShadcnColorPicker>
      </PopoverContent>
    </Popover>
  );
}
