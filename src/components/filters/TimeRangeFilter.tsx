import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  year: number;
  quarter: string;
  onYearChange: (y: number) => void;
  onQuarterChange: (q: string) => void;
  yearWidth?: string;
  quarterWidth?: string;
}

export function TimeRangeFilter({
  year,
  quarter,
  onYearChange,
  onQuarterChange,
  yearWidth = "w-[100px]",
  quarterWidth = "w-[130px]",
}: Props) {
  return (
    <>
      <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
        <SelectTrigger className={`${yearWidth} h-11`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[year - 1, year, year + 1].map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={quarter} onValueChange={onQuarterChange}>
        <SelectTrigger className={`${quarterWidth} h-11`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả quý</SelectItem>
          <SelectItem value="1">Quý 1</SelectItem>
          <SelectItem value="2">Quý 2</SelectItem>
          <SelectItem value="3">Quý 3</SelectItem>
          <SelectItem value="4">Quý 4</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
