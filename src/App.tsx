import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

export function App() {
  const [date, setDate] = useState<Date>();

  return (
    <form
      action=""
      onSubmit={(e) => {
        e.preventDefault();
        console.log(date);
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">
            {date?.toLocaleDateString() ?? 'Show calendar'}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button type="submit">Submit</Button>
    </form>
  );
}
