import './TransactionTimeline.css';

export type TimelineStep = {
  step: number;
  label: string;
};

type TransactionTimelineProps = {
  steps: TimelineStep[];
  currentStep: number;
  failed?: boolean;
};

export default function TransactionTimeline({
  steps,
  currentStep,
  failed = false,
}: TransactionTimelineProps) {
  return (
    <div className="tx-timeline" aria-label="Tiến trình giao dịch">
      {steps.map((step, index) => {
        const done = !failed && currentStep > step.step;
        const active = !failed && currentStep === step.step;

        return (
          <div
            key={step.step}
            className={`tx-timeline-item ${done ? 'done' : ''} ${active ? 'active' : ''} ${failed ? 'failed' : ''}`.trim()}
          >
            <div className="tx-timeline-dot">{step.step}</div>
            <span className="tx-timeline-label">{step.label}</span>
            {index < steps.length - 1 ? <span className="tx-timeline-line" aria-hidden="true" /> : null}
          </div>
        );
      })}
    </div>
  );
}