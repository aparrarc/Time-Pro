/**
 * Export Utilities — CSV + Print-to-PDF
 * No external dependencies required.
 */

// ── CSV Export ─────────────────────────────────────────

interface CsvOptions {
    filename: string;
    headers: string[];
    rows: string[][];
}

export function exportToCsv({ filename, headers, rows }: CsvOptions) {
    const escapeCell = (cell: string) => {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
    };

    const csvContent = [
        headers.map(escapeCell).join(','),
        ...rows.map(row => row.map(escapeCell).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

// ── Print-to-PDF ───────────────────────────────────────

interface PdfOptions {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: string[][];
    footer?: string;
}

export function exportToPdf({ title, subtitle, headers, rows, footer }: PdfOptions) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para exportar el PDF.');
        return;
    }

    const tableRows = rows
        .map(row =>
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${title} — TimeTrack Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1e293b;
            background: white;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e2e8f0;
        }
        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
        }
        .header .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
        }
        .header .brand {
            font-size: 12px;
            font-weight: 700;
            color: #6366f1;
            letter-spacing: 0.05em;
        }
        .header .date {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 8px;
        }
        th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 10px;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
        }
        td {
            padding: 8px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        tr:nth-child(even) { background: #fafbfc; }
        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
        }
        @media print {
            body { padding: 20px; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>${title}</h1>
            ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
        </div>
        <div style="text-align: right;">
            <div class="brand">TimeTrack Pro</div>
            <div class="date">${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
    </div>
    <table>
        <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    <div class="footer">
        ${footer || `Generado por TimeTrack Pro · ${new Date().toLocaleString('es-ES')} · Cumplimiento RGPD`}
    </div>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
}

// ── Helpers ────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Format hours as "Xh Ym" string
 */
export function formatHoursMinutes(totalHours: number): string {
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
