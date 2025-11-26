import { Calendar } from "primereact/calendar";

interface Props {
  PlaceHolder: string,
  startDate: Date | undefined,
  setStartDate: (Date: Date) => {},
  CalendarLabel: string,
  startTime: Date | undefined,
  setStartTime: (Date: Date) => {},
}

export default function DateTimeComponent(props: Props) {

  return (
    <div className="flex gap-2">
      <div className="w-full">
          <label htmlFor="calendar-12h">
            {props.CalendarLabel}
          </label>
          <Calendar
            id="calendar-12h"
            placeholder={props.PlaceHolder}
            value={props.startDate}
            onChange={(e) => { if(e.value && e.value instanceof Date) props.setStartDate(e.value) } }
            className="w-full"
            showButtonBar 
          />
      </div>

      <span className="flex flex-col">
          <label htmlFor="startTime">Start Time:</label>
          <Calendar id="startTime" value={props.startTime} onChange={(e) => { if(e.value && e.value instanceof Date) props.setStartTime(e.value) } } timeOnly hourFormat="12" />
      </span>
    </div>

  );
}
