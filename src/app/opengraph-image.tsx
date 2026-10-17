import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VibeFlow — Batch USDC payments. One signature.';
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
          background: '#0b0d16',
          position: 'relative',
        }}
      >
        {/* violet glow */}
        <div
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-120px',
            width: '560px',
            height: '560px',
            borderRadius: '9999px',
            background: 'rgba(139, 124, 246, 0.18)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-140px',
            width: '480px',
            height: '480px',
            borderRadius: '9999px',
            background: 'rgba(34, 211, 238, 0.10)',
            filter: 'blur(60px)',
          }}
        />

        {/* badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            alignSelf: 'flex-start',
            border: '1px solid rgba(247, 248, 252, 0.14)',
            borderRadius: '9999px',
            padding: '10px 20px',
            background: 'rgba(247, 248, 252, 0.04)',
            fontSize: '24px',
            fontWeight: 600,
            color: '#f7f8fc',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '9999px',
              background: '#8b7cf6',
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
            color: '#f7f8fc',
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
            color: '#9ca5bd',
            lineHeight: 1.15,
          }}
        >
          Batch USDC payments. <span style={{ color: '#8b7cf6' }}>One signature.</span>
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
                border: '1px solid rgba(139, 124, 246, 0.35)',
                borderRadius: '9999px',
                padding: '10px 22px',
                background: 'rgba(139, 124, 246, 0.12)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#8b7cf6',
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
