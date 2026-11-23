import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VibeFlow - Batch USDC payments. One signature.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '80px',
          background: '#f5f6fa',
          position: 'relative',
        }}
      >
        {/* badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            alignSelf: 'flex-start',
            border: '1px solid rgba(11, 13, 22, 0.12)',
            borderRadius: '9999px',
            padding: '10px 20px',
            background: '#ffffff',
            fontSize: '24px',
            fontWeight: 600,
            color: '#0b0d16',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '9999px',
              background: '#2775ca',
            }}
          />
          Built on Arc Blockchain
        </div>

        {/* wordmark */}
        <div
          style={{
            display: 'flex',
            marginTop: '36px',
            fontSize: '120px',
            fontWeight: 800,
            letterSpacing: '-4px',
            color: '#0b0d16',
            lineHeight: 1,
          }}
        >
          VibeFlow
        </div>

        {/* tagline */}
        <div
          style={{
            display: 'flex',
            marginTop: '20px',
            fontSize: '52px',
            fontWeight: 600,
            color: '#59637a',
            lineHeight: 1.15,
          }}
        >
          Batch USDC payments. <span style={{ color: '#2775ca' }}>One signature.</span>
        </div>

        {/* footer pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginTop: '48px',
          }}
        >
          {['USDC', 'EURC', 'Sub-second finality'].map((label) => (
            <div
              key={label}
              style={{
                border: '1px solid rgba(39, 117, 202, 0.35)',
                borderRadius: '9999px',
                padding: '10px 22px',
                background: 'rgba(39, 117, 202, 0.08)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#2775ca',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
