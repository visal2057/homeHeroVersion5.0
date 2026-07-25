import { useState, useMemo } from 'react';
import DayTasksPreview from './DayTasksPreview.jsx';
import { rowPreviewPosition } from '../rowPreviewPosition.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Marking a day unavailable already has a home on the Provider Dashboard's
// Go Offline flow -- this calendar's job is primarily to show what's due
// each day, so the only availability action kept here is removing an
// existing unavailable mark, folded into the same day popup.
export default function UnavailableDateCalendar({ unavailableDates = [], onToggleDate, jobs = [] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activeDay, setActiveDay] = useState(null); // date key string, e.g. "2026-09-05"
  const [isPinned, setIsPinned] = useState(false);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const unavailableSet = new Set(unavailableDates);

  const jobsByDay = useMemo(() => {
    const map = new Map();
    for (const job of jobs) {
      if (!job.service_date) continue;
      const key = toKey(new Date(job.service_date));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(job);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.service_date) - new Date(b.service_date));
    }
    return map;
  }, [jobs]);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setActiveDay(null);
    setIsPinned(false);
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setActiveDay(null);
    setIsPinned(false);
  }

  function closePreview() {
    setActiveDay(null);
    setIsPinned(false);
  }

  function handleDayEnter(day, e) {
    if (isPinned) return;
    setActiveDay(toKey(new Date(year, month, day)));
    setPreviewPos(rowPreviewPosition(e.currentTarget.getBoundingClientRect()));
  }

  function handleDayLeave() {
    if (isPinned) return;
    setActiveDay(null);
  }

  function handleDayClick(day, e) {
    const key = toKey(new Date(year, month, day));
    if (isPinned && activeDay === key) {
      closePreview();
      return;
    }
    setActiveDay(key);
    setIsPinned(true);
    setPreviewPos(rowPreviewPosition(e.currentTarget.getBoundingClientRect()));
  }

  function handleRemoveUnavailable() {
    if (activeDay) onToggleDate?.(activeDay);
    closePreview();
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const [activeYear, activeMonth, activeDate] = activeDay ? activeDay.split('-').map(Number) : [];
  const activeDateObj = activeDay ? new Date(activeYear, activeMonth - 1, activeDate) : null;
  const activeLabel = activeDateObj
    ? activeDateObj.toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

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
          const taskCount = jobsByDay.get(key)?.length ?? 0;

          let cls = 'provider-calendar-day';
          if (isPast)        cls += ' past';
          else if (isToday)  cls += ' today';
          if (isUnavailable) cls += ' unavailable';
          if (activeDay === key) cls += ' active';

          return (
            <button
              key={key}
              type="button"
              className={cls}
              onClick={(e) => handleDayClick(day, e)}
              onMouseEnter={(e) => handleDayEnter(day, e)}
              onMouseLeave={handleDayLeave}
              aria-label={`${MONTHS[month]} ${day}${taskCount > 0 ? `, ${taskCount} job${taskCount > 1 ? 's' : ''}` : ''}${isUnavailable ? ', marked unavailable' : ''}`}
            >
              <span className="provider-calendar-day-num">{day}</span>
              {taskCount > 0 && <span className="provider-calendar-day-badge">{taskCount}</span>}
            </button>
          );
        })}
      </div>

      <p className="provider-calendar-hint">
        Hover or click a day to see what's due. Red dates are blocked for new bookings — go offline from the Dashboard to mark a day unavailable.
      </p>

      {activeDay && (
        <DayTasksPreview
          dateLabel={activeLabel}
          jobs={jobsByDay.get(activeDay) ?? []}
          isUnavailable={unavailableSet.has(activeDay)}
          pinned={isPinned}
          onRemoveUnavailable={handleRemoveUnavailable}
          onClose={closePreview}
          style={{ top: previewPos.top, left: previewPos.left }}
        />
      )}
    </div>
  );
}
