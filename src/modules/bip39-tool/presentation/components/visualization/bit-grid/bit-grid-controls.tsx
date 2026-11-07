import { Checkbox } from '$/components/ui/checkbox';
import { Label } from '$/components/ui/label';

interface BitGridControlsProps {
  showWords: boolean;
  showIndexes: boolean;
  onToggleWords: () => void;
  onToggleIndexes: () => void;
}

export function BitGridControls({
  showWords,
  showIndexes,
  onToggleWords,
  onToggleIndexes,
}: BitGridControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-words"
          checked={showWords}
          onCheckedChange={() => onToggleWords()}
        />
        <Label
          htmlFor="show-words"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          Show words
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="show-indexes"
          checked={showIndexes}
          onCheckedChange={() => onToggleIndexes()}
        />
        <Label
          htmlFor="show-indexes"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          Show indexes
        </Label>
      </div>
    </div>
  );
}
