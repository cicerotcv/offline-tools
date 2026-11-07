import { useEffect, useState } from 'react';

import { Printer } from 'lucide-react';
import { createPortal } from 'react-dom';

import { renderQrSvg } from '@/shared/lib/qr';

import { Button } from '$/components/ui/button';

import { cardDensityFor, shareRows } from '../../../lib/cards';

interface ShareCardsPrintProps {
  shares: string[];
  setId: string;
  threshold: number;
}

/** The bit-grid mark of the brand, in black for print. */
function Mark() {
  const on = [0, 2, 4, 5, 7, 8];
  return (
    <svg viewBox="0 0 9 9" className="pc-mark" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x={(i % 3) * 3}
          y={Math.floor(i / 3) * 3}
          width="2.6"
          height="2.6"
          rx="0.4"
          opacity={on.includes(i) ? 1 : 0.18}
        />
      ))}
    </svg>
  );
}

function ShareCard({
  share,
  index,
  total,
  setId,
  threshold,
  qr,
}: {
  share: string;
  index: number;
  total: number;
  setId: string;
  threshold: number;
  qr: string | undefined;
}) {
  // Callers only print shares that fit (see ShareOutput).
  const density = cardDensityFor(share.length)!;
  return (
    <section className={`print-card pc-${density.name}`}>
      <div className="pc-pair">
        {/* Front: who this share is, and its QR. */}
        <article className="pc-face pc-front">
          <div className="pc-front-info">
            <p className="pc-brand">
              <Mark />
              Offline Tools
            </p>
            <div>
              <p className="pc-number">
                {index + 1}
                <span>/{total}</span>
              </p>
              <p className="pc-title">Shamir secret share</p>
            </div>
            <dl className="pc-facts">
              <div>
                <dt>Needed</dt>
                <dd>
                  {threshold} of {total}
                </dd>
              </div>
              <div>
                <dt>Set</dt>
                <dd>{setId}</dd>
              </div>
            </dl>
          </div>
          {qr && (
            <div
              className="pc-qr"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          )}
        </article>

        {/* Back: the share to type in, and how to recover. */}
        <article className="pc-face pc-back">
          <p className="pc-back-head">
            <span>
              Share {index + 1}/{total}
            </span>
            <span>v3 · AES-256-GCM</span>
          </p>
          <ol className="pc-share">
            {shareRows(share, density.groupsPerRow).map((row, i) => (
              <li key={i}>
                <span className="pc-row">{String(i + 1).padStart(2, '0')}</span>
                {row.map((group, j) => (
                  <span key={j}>{group}</span>
                ))}
              </li>
            ))}
          </ol>
          <p className="pc-steps">
            Keep apart from the other shares. Recover offline in Offline Tools,
            Shamir, with any {threshold}.
          </p>
        </article>
      </div>
      <p className="pc-cut-note">
        Cut along the outer line, fold on the center line, and glue or laminate:
        a two-sided card the size of a credit card (85.6 × 54 mm).
      </p>
    </section>
  );
}

/**
 * Optional: one printable card per share (as many per page as fit), with its QR and
 * recovery steps. Only the share itself goes on paper.
 */
export function ShareCardsPrint({
  shares,
  setId,
  threshold,
}: ShareCardsPrintProps) {
  const [qrs, setQrs] = useState<string[] | null>(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!printing) return;
    let cancelled = false;
    Promise.all(shares.map((share) => renderQrSvg(share))).then((svgs) => {
      if (cancelled) return;
      setQrs(svgs);
    });
    return () => {
      cancelled = true;
    };
  }, [printing, shares]);

  useEffect(() => {
    if (!printing || !qrs) return;
    const done = () => {
      setPrinting(false);
      setQrs(null);
    };
    window.addEventListener('afterprint', done, { once: true });
    // Let the cards mount before the print dialog opens.
    const id = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('afterprint', done);
    };
  }, [printing, qrs]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPrinting(true)}
        disabled={printing}
      >
        <Printer aria-hidden className="h-4 w-4" />
        Print cards
      </Button>
      {printing &&
        qrs &&
        createPortal(
          <div className="print-cards">
            {shares.map((share, index) => (
              <ShareCard
                key={share}
                share={share}
                index={index}
                total={shares.length}
                setId={setId}
                threshold={threshold}
                qr={qrs[index]}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
