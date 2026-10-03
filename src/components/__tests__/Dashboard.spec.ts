import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Dashboard } from '../Dashboard';
import type { DashboardMetrics } from '../Dashboard';

function renderDashboard(metrics: DashboardMetrics): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(Dashboard, {
        metrics,
        tracks: [],
        weakAreas: [],
        activeCert: null,
        activeCertId: '',
        activeTrack: null,
        nextCert: null,
        nextCertId: null,
        dueCount: 0,
        readiness: null,
      }),
    ),
  );
}

describe('Dashboard first-run state', () => {
  it('explains how to populate empty metrics instead of presenting zero scores', () => {
    const markup = renderDashboard({
      completion: 0,
      avgScore: 0,
      streak: 0,
      examsTaken: 0,
      hasStudyActivity: false,
      hasExamActivity: false,
    });
    const metricSection = markup.match(/<section class="dashboard-metrics"[\s\S]*?<\/section>/)?.[0] ?? '';

    expect(markup).toContain('Start studying to track progress');
    expect(markup).toContain('Take a mock exam to see your score');
    expect(markup).toContain('Study to start a streak');
    expect(markup).toContain('Take a mock exam to log your first attempt');
    expect(markup).toContain('Study some questions to discover which topics need more review.');
    expect(metricSection.match(/>—<\/div>/g) ?? []).toHaveLength(4);
  });
});
