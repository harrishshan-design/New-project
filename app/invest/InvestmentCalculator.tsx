"use client";

import { useMemo, useState } from "react";
import { formatRinggit, type InvestmentOpportunity, type ScenarioKey } from "./invest-data";

const SCENARIO_KEYS: ScenarioKey[] = ["conservative", "base", "optimistic"];

function projectOutcome(opportunity: InvestmentOpportunity, amount: number, key: ScenarioKey) {
  const scenario = opportunity.scenarios[key];
  const ownership = amount / opportunity.propertyValue;
  const grossRent = amount * (scenario.rentalYield / 100);
  const occupiedRent = grossRent * (scenario.occupancy / 100);
  const allocatedCosts = opportunity.annualCosts * ownership;
  const estimatedAnnualDistribution = Math.max(0, occupiedRent - allocatedCosts);
  const projectedShareValue = amount * Math.pow(1 + scenario.annualGrowth / 100, opportunity.targetHoldYears);
  return {
    ownershipPercent: ownership * 100,
    estimatedAnnualDistribution,
    projectedShareValue,
    illustrativeTotal: projectedShareValue + estimatedAnnualDistribution * opportunity.targetHoldYears
  };
}

export default function InvestmentCalculator({ opportunity }: { opportunity: InvestmentOpportunity }) {
  const maxAmount = Math.min(Math.floor(opportunity.propertyValue / opportunity.slots / 5000) * 5000, 250000);
  const [amount, setAmount] = useState(Math.min(50000, maxAmount));
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("base");
  const result = useMemo(() => projectOutcome(opportunity, amount, scenarioKey), [amount, opportunity, scenarioKey]);
  const scenario = opportunity.scenarios[scenarioKey];

  return (
    <section className="inv-calculator" aria-labelledby="investment-calculator-title">
      <header className="inv-calculator-head">
        <h2 id="investment-calculator-title">Investment scenario calculator</h2>
        <p>Explore a hypothetical allocation. This does not reserve a slot or predict an actual return.</p>
      </header>
      <div className="inv-calculator-controls">
        <div className="inv-amount-line">
          <label htmlFor="investment-amount">Illustrative amount</label>
          <output htmlFor="investment-amount" data-testid="investment-amount-output">{formatRinggit(amount)}</output>
        </div>
        <input
          className="inv-range"
          id="investment-amount"
          data-testid="investment-amount"
          type="range"
          min={opportunity.minimumInvestment}
          max={maxAmount}
          step="5000"
          value={amount}
          onInput={(event) => setAmount(Number(event.currentTarget.value))}
        />
        <div className="inv-range-labels"><span>{formatRinggit(opportunity.minimumInvestment)}</span><span>{formatRinggit(maxAmount)}</span></div>
        <div className="inv-scenario-tabs" aria-label="Scenario selection">
          {SCENARIO_KEYS.map((key) => (
            <button key={key} className={key === scenarioKey ? "is-active" : ""} type="button" aria-pressed={key === scenarioKey} onClick={() => setScenarioKey(key)}>
              {opportunity.scenarios[key].label}
            </button>
          ))}
        </div>
      </div>
      <div className="inv-calculator-results" aria-live="polite">
        <div className="inv-metric"><span>Indicative allocation</span><strong>{result.ownershipPercent.toFixed(2)}%</strong></div>
        <div className="inv-metric"><span>Est. annual distribution</span><strong>{formatRinggit(result.estimatedAnnualDistribution)}</strong></div>
        <div className="inv-metric"><span>Projected share value</span><strong>{formatRinggit(result.projectedShareValue)}</strong></div>
        <div className="inv-metric"><span>Illustrative 5-year total</span><strong>{formatRinggit(result.illustrativeTotal)}</strong></div>
      </div>
      <p className="inv-model-note">
        <strong>{scenario.label} model:</strong> {scenario.note} Uses {scenario.rentalYield.toFixed(1)}% target gross rental yield, {scenario.occupancy}% occupancy and {scenario.annualGrowth.toFixed(1)}% annual value movement. Operating costs are deducted; taxes, financing, legal and future platform fees are not. Results may be lower or negative.
      </p>
      <div style={{ overflowX: "auto", padding: "0 24px 22px" }}>
        <table className="inv-scenario-table">
          <thead><tr><th>Scenario</th><th>Occupancy</th><th>Rental yield</th><th>Annual growth</th><th>Illustrative total</th></tr></thead>
          <tbody>
            {SCENARIO_KEYS.map((key) => {
              const model = projectOutcome(opportunity, amount, key);
              const assumptions = opportunity.scenarios[key];
              return (
                <tr key={key}>
                  <td><strong>{assumptions.label}</strong></td>
                  <td>{assumptions.occupancy}%</td>
                  <td>{assumptions.rentalYield.toFixed(1)}%</td>
                  <td>{assumptions.annualGrowth.toFixed(1)}%</td>
                  <td>{formatRinggit(model.illustrativeTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
