import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function UnavailableDateCalendar({ unavailableDates = [], onToggleDate }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const unavailableSet = new Set(unavailableDates);

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }

  function handleDayClick(day) {
    const d = new Date(year, month, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    onToggleDate?.(toKey(d));
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="provider-calendar-wrap">
      <div className="provider-calendar-header">
        <span className="provider-calendar-title">{MONTHS[month]} {year}</span>
        <div className="provider-calendar-nav">
          <button type="button" onClick={prevMonth} aria-label="Previous month">‹</button>
          <button type="button" onClick={nextMonth} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="provider-calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="provider-calendar-day-name">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="provider-calendar-day empty" />;
          }

          const d = new Date(year, month, day);
          const key = toKey(d);
          const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = d.toDateString() === today.toDateString();
          const isUnavailable = unavailableSet.has(key);

          let cls = 'provider-calendar-day';
          if (isPast)        cls += ' past';
          else if (isToday)  cls += ' today';
          if (isUnavailable) cls += ' unavailable';

          return (
            <button
              key={key}
              type="button"
              className={cls}
              onClick={() => handleDayClick(day)}
              aria-label={`${isUnavailable ? 'Remove unavailable: ' : 'Mark unavailable: '}${MONTHS[month]} ${day}`}
              aria-pressed={isUnavailable}
              disabled={isPast}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Click a date to mark / unmark it as unavailable. Red dates are blocked for new bookings.
      </p>
    </div>
  );
}
