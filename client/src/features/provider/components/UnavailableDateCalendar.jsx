import { useState, useMemo } from 'react';
import DayTasksPreview from './DayTasksPreview.jsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const PREVIEW_WIDTH = 280;
const PREVIEW_GAP = 8; // clear gap so the popup never touches the tile's own border
const VIEWPORT_MARGIN = 12;

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Unlike rowPreviewPosition.js (wide rows, anchored below-left), a calendar
// tile is small and square, so the popup is centered above it instead.
// Positioned with `bottom` rather than `top` so its bottom edge stays
// pinned just above the tile regardless of how tall the popup's content
// makes it -- growing upward, never downward into the tile.
function dayPreviewPosition(tileRect) {
  let left = tileRect.left + tileRect.width / 2 - PREVIEW_WIDTH / 2;
  if (left + PREVIEW_WIDTH + VIEWPORT_MARGIN > window.innerWidth) {
    left = window.innerWidth - PREVIEW_WIDTH - VIEWPORT_MARGIN;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  const bottom = window.innerHeight - tileRect.top + PREVIEW_GAP;

  return { left, bottom };
}

// Marking a day unavailable already has a home on the Provider Dashboard's
// Go Offline flow -- this calendar's job is primarily to show what's due
// each day, so the only availability action kept here is removing an
// existing unavailable mark, folded into the same day popup.
export default function UnavailableDateCalendar({ unavailableDates = [], onToggleDate, jobs = [], overrideActiveToday = false }) {
  const today = new Date();
  const todayKey = toKey(today);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activeDay, setActiveDay] = useState(null); // date key string, e.g. "2026-09-05"
  const [isPinned, setIsPinned] = useState(false);
  const [previewPos, setPreviewPos] = useState({ bottom: 0, left: 0 });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const unavailableSet = new Set(unavailableDates);
  // A same-day online override (see ProviderDashboardPage.jsx's toggle)
  // never edits the underlying unavailable dates - it only ever changes
  // what's displayed for today, so this is purely a display-layer check on
  // top of unavailableSet, not a filter applied to the data itself.
  function isDayUnavailable(key) {
    return unavailableSet.has(key) && !(key === todayKey && overrideActiveToday);
  }

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
    setPreviewPos(dayPreviewPosition(e.currentTarget.getBoundingClientRect()));
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
    setPreviewPos(dayPreviewPosition(e.currentTarget.getBoundingClientRect()));
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
          const isUnavailable = isDayUnavailable(key);
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
        Hover or click a day to see what's due. Red dates are blocked for new bookings — use "Mark unavailable dates" on the Dashboard to block a date range.
      </p>

      {activeDay && (
        <DayTasksPreview
          dateLabel={activeLabel}
          jobs={jobsByDay.get(activeDay) ?? []}
          isUnavailable={isDayUnavailable(activeDay)}
          pinned={isPinned}
          onRemoveUnavailable={handleRemoveUnavailable}
          onClose={closePreview}
          style={{ bottom: previewPos.bottom, left: previewPos.left }}
        />
      )}
    </div>
  );
}
