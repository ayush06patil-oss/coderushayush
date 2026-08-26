import React from 'react';
import { AlertCircle, Building2, Navigation, Truck } from 'lucide-react';

export default function WorkflowStepper({ currentStep, onStepClick }) {
  const steps = [
    { number: 1, label: 'Emergency', sublabel: 'Create Request', icon: AlertCircle },
    { number: 2, label: 'Select Hospital', sublabel: 'Specialist Match', icon: Building2 },
    { number: 3, label: 'Calculate Route', sublabel: 'Dijkstra / A*', icon: Navigation },
    { number: 4, label: 'Dispatch Ambulance', sublabel: 'Fleet Deployment', icon: Truck },
  ];

  return (
    <div className="stepper-card">
      <div className="stepper-container">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div 
                className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
              >
                <div className="step-badge">
                  {isCompleted ? '✓' : step.number}
                </div>
                <div className="step-info">
                  <span className="step-number-text">STEP {step.number}</span>
                  <span className="step-label">
                    {isCompleted && step.number === 3 ? 'Route Calculated' : step.label}
                  </span>
                </div>
                <Icon size={16} className="step-icon" />
              </div>

              {index < steps.length - 1 && (
                <div className={`stepper-connector ${currentStep > step.number ? 'completed' : ''}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
