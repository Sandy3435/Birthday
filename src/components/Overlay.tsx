import { useStore } from '../store';

export default function Overlay() {
  const opened = useStore((s) => s.opened);
  const scroll = useStore((s) => s.scroll);

  return (
    <>
      {scroll < 0.06 && (
        <div className="scroll-hint">
          Scroll to begin
          <span className="scroll-arrow" aria-hidden="true">↓</span>
        </div>
      )}

      {scroll < 0.9 && (
        <div className="tap-hint">Tap a photo. There is something on the other side.</div>
      )}

      <div className="progress-pill" aria-live="polite">
        {opened.size} / 27 opened
      </div>

      {scroll > 0.93 && (
        <div className="closing">
          <p className="closing-head">And that's only 27 of the reasons.</p>
          <p className="closing-body">Your final birthday message will go here.</p>
        </div>
      )}
    </>
  );
}
