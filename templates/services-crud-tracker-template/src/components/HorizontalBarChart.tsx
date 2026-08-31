import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface BarDatum {
  label: string;
  value: number;
}

const WIDTH = 760;
const ROW_H = 44;
const MARGIN = { top: 8, right: 80, bottom: 8, left: 160 };

/**
 * Horizontal bar chart. Reused for "revenue by practice" and "FTE by
 * practice" — pass a value formatter to control the trailing label.
 */
export function HorizontalBarChart({
  data,
  color = '#0085ca',
  format = (n: number) => String(n),
  title,
  ariaLabel,
}: {
  data: BarDatum[];
  color?: string;
  format?: (n: number) => string;
  title: string;
  ariaLabel: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    if (data.length === 0) return;

    const innerW = WIDTH - MARGIN.left - MARGIN.right;
    const height = data.length * ROW_H + MARGIN.top + MARGIN.bottom;
    svg.attr('viewBox', `0 0 ${WIDTH} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, data.length * ROW_H])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.value) ?? 1) * 1.05])
      .range([0, innerW]);

    // Labels
    g.append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('x', -12)
      .attr('y', (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#374151')
      .attr('font-size', 12)
      .text((d) => d.label);

    // Bars
    g.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.label) ?? 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.value))
      .attr('fill', color);

    // Value labels
    g.append('g')
      .selectAll('text.value')
      .data(data)
      .join('text')
      .attr('class', 'value')
      .attr('x', (d) => x(d.value) + 8)
      .attr('y', (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', '#111827')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text((d) => format(d.value));
  }, [data, color, format]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-deep">
        {title}
      </h3>
      <svg
        ref={ref}
        className="h-auto w-full"
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}
