import React from 'react';

// 16-bit Pixel Striker Sprite
export function PixelStriker({ isKicking }) {
  return (
    <svg
      viewBox="0 0 24 28"
      className="w-16 h-20 pixelated drop-shadow-lg select-none pointer-events-none"
    >
      {/* Hair */}
      <rect x="9" y="1" width="6" height="4" fill="#222" />
      <rect x="8" y="2" width="8" height="3" fill="#222" />

      {/* Head / Face */}
      <rect x="10" y="4" width="4" height="4" fill="#fbb083" />
      <rect x="9" y="5" width="1" height="2" fill="#fbb083" />
      <rect x="13" y="5" width="1" height="1" fill="#000" />

      {/* Yellow Kit Jersey with Green Trim */}
      <rect x="8" y="8" width="7" height="7" fill="#facc15" />
      <rect x="8" y="8" width="2" height="2" fill="#15803d" />
      <rect x="10" y="10" width="3" height="4" fill="#15803d" />

      {/* Arms */}
      <rect x="5" y="9" width="3" height="2" fill="#fbb083" />
      <rect x="4" y="10" width="2" height="2" fill="#fbb083" />
      <rect x="15" y="9" width="3" height="3" fill="#fbb083" />
      <rect x="16" y="11" width="2" height="2" fill="#fbb083" />

      {/* Shorts */}
      <rect x="8" y="15" width="7" height="4" fill="#166534" />
      <rect x="11" y="17" width="1" height="2" fill="#0b381b" />

      {!isKicking ? (
        <>
          {/* Standing Legs */}
          <rect x="8" y="19" width="3" height="3" fill="#fbb083" />
          <rect x="8" y="22" width="3" height="3" fill="#ffffff" />
          <rect x="7" y="25" width="4" height="2" fill="#2563eb" />

          <rect x="12" y="19" width="3" height="3" fill="#fbb083" />
          <rect x="12" y="22" width="3" height="3" fill="#ffffff" />
          <rect x="12" y="25" width="4" height="2" fill="#2563eb" />
        </>
      ) : (
        <>
          {/* High Kick Strike Pose */}
          <rect x="8" y="19" width="3" height="3" fill="#fbb083" />
          <rect x="8" y="22" width="3" height="3" fill="#ffffff" />
          <rect x="7" y="25" width="4" height="2" fill="#2563eb" />

          <rect x="13" y="18" width="4" height="3" fill="#fbb083" />
          <rect x="16" y="19" width="4" height="3" fill="#ffffff" />
          <rect x="18" y="19" width="4" height="3" fill="#2563eb" />
        </>
      )}
    </svg>
  );
}

// 16-bit Pixel Referee Sprite (Warning / Yellow Card / Red Card / VAR Poses)
export function PixelReferee({ pose = 'warning' }) {
  // Pose 1: Running Ref blowing whistle & pointing (Warning / Advantage style)
  if (pose === 'warning') {
    return (
      <svg
        viewBox="0 0 28 28"
        className="w-20 h-20 pixelated drop-shadow-xl select-none pointer-events-none"
      >
        {/* Dark Hair */}
        <rect x="9" y="2" width="7" height="3" fill="#271c19" />
        <rect x="8" y="3" width="8" height="2" fill="#271c19" />

        {/* Head & Face */}
        <rect x="9" y="5" width="6" height="4" fill="#f3a871" />
        {/* Silver Whistle + Sound Lines */}
        <rect x="15" y="7" width="3" height="2" fill="#d4d4d8" />
        <rect x="16" y="8" width="1" height="1" fill="#3f3f46" />
        <rect x="19" y="5" width="2" height="1" fill="#ffffff" />
        <rect x="20" y="7" width="2" height="1" fill="#ffffff" />

        {/* Yellow Referee Shirt with Black Trim & Pocket */}
        <rect x="8" y="9" width="8" height="7" fill="#facc15" />
        <rect x="9" y="9" width="2" height="2" fill="#18181b" />
        <rect x="13" y="9" width="2" height="2" fill="#18181b" />
        <rect x="13" y="11" width="2" height="2" fill="#ca8a04" />

        {/* Left Arm Back + Right Arm Pointing Forward */}
        <rect x="5" y="10" width="3" height="5" fill="#f3a871" />
        <rect x="16" y="9" width="8" height="2" fill="#f3a871" />
        <rect x="22" y="8" width="1" height="1" fill="#f3a871" />

        {/* Black Shorts */}
        <rect x="8" y="16" width="8" height="4" fill="#18181b" />

        {/* Running Stride Legs */}
        <rect x="6" y="20" width="3" height="3" fill="#f3a871" />
        <rect x="4" y="22" width="3" height="3" fill="#18181b" />
        <rect x="14" y="20" width="3" height="3" fill="#f3a871" />
        <rect x="15" y="23" width="3" height="4" fill="#18181b" />
        <rect x="15" y="26" width="4" height="1" fill="#facc15" />
      </svg>
    );
  }

  // Poses 2+: Striped Shirt Referee (Yellow Card, Red Card, VAR Ear, Play On)
  const isCardPose = pose === 'yellow' || pose === 'red';
  const cardColor = pose === 'red' ? '#ef4444' : '#facc15';

  return (
    <svg
      viewBox="0 0 28 30"
      className="w-20 h-22 pixelated drop-shadow-xl select-none pointer-events-none"
    >
      {/* Raised Card in Right Hand (Viewer's Left) */}
      {isCardPose && (
        <>
          <rect x="4" y="0" width="5" height="7" fill="#000000" />
          <rect x="5" y="1" width="3" height="5" fill={cardColor} />
          {/* Raised Arm holding card */}
          <rect x="5" y="7" width="3" height="4" fill="#f3a871" />
          <rect x="7" y="10" width="2" height="3" fill="#f3a871" />
        </>
      )}

      {/* Play-On / No Card Both Arms Out Pose */}
      {pose === 'playOn' && (
        <>
          <rect x="2" y="11" width="7" height="2" fill="#f3a871" />
          <rect x="19" y="11" width="7" height="2" fill="#f3a871" />
        </>
      )}

      {/* Hair & Head */}
      <rect x="11" y="4" width="6" height="2" fill="#3f3f46" />
      <rect x="10" y="6" width="8" height="5" fill="#f3a871" />

      {/* Whistle at mouth */}
      <rect x="13" y="9" width="3" height="2" fill="#52525b" />

      {/* Black & White Vertical Striped Referee Shirt */}
      <rect x="9" y="11" width="10" height="8" fill="#18181b" />
      <rect x="10" y="11" width="2" height="8" fill="#ffffff" />
      <rect x="13" y="11" width="2" height="8" fill="#ffffff" />
      <rect x="16" y="11" width="2" height="8" fill="#ffffff" />
      {/* Ref Crest */}
      <rect x="15" y="13" width="2" height="2" fill="#18181b" />

      {/* Left Hand to Whistle or Ear (VAR Check) */}
      {pose === 'ear' ? (
        <>
          <rect x="6" y="12" width="3" height="4" fill="#f3a871" />
          <rect x="18" y="6" width="3" height="6" fill="#f3a871" />
        </>
      ) : (
        pose !== 'playOn' && (
          <rect x="16" y="10" width="4" height="4" fill="#f3a871" />
        )
      )}

      {/* Black Shorts */}
      <rect x="10" y="19" width="8" height="4" fill="#18181b" />

      {/* Legs & Striped Socks */}
      <rect x="10" y="23" width="3" height="2" fill="#f3a871" />
      <rect x="15" y="23" width="3" height="2" fill="#f3a871" />
      <rect x="10" y="25" width="3" height="4" fill="#18181b" />
      <rect x="15" y="25" width="3" height="4" fill="#18181b" />
      <rect x="10" y="25" width="3" height="1" fill="#ffffff" />
      <rect x="15" y="25" width="3" height="1" fill="#ffffff" />
    </svg>
  );
}

// 16-bit Pixel Ball
export function PixelBall({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 16 16"
      style={{ width: size, height: size }}
      className="pixelated drop-shadow select-none pointer-events-none"
    >
      <rect x="4" y="1" width="8" height="14" fill="#ffffff" />
      <rect x="1" y="4" width="14" height="8" fill="#ffffff" />
      <rect x="4" y="4" width="3" height="3" fill="#1f2937" />
      <rect x="9" y="4" width="3" height="3" fill="#1f2937" />
      <rect x="6" y="7" width="4" height="4" fill="#111827" />
      <rect x="4" y="9" width="3" height="3" fill="#1f2937" />
      <rect x="9" y="9" width="3" height="3" fill="#1f2937" />
      <rect x="5" y="0" width="6" height="1" fill="#000" />
      <rect x="5" y="15" width="6" height="1" fill="#000" />
      <rect x="0" y="5" width="1" height="6" fill="#000" />
      <rect x="15" y="5" width="1" height="6" fill="#000" />
    </svg>
  );
}

// Top Horizontal Crowd Stand
export function PixelCrowdTop({ excitement = 'low' }) {
  const jumpClass =
    excitement === 'topBins' ? 'animate-bounce' : excitement === 'high' ? 'animate-pulse' : '';

  const fans = [
    { head: '#e0a97a', shirt: '#dc2626' },
    { head: '#fbb083', shirt: '#2563eb' },
    { head: '#8d5524', shirt: '#facc15' },
    { head: '#f5c6a5', shirt: '#16a34a' },
    { head: '#c68642', shirt: '#9333ea' },
    { head: '#fbb083', shirt: '#ea580c' },
    { head: '#e0a97a', shirt: '#0284c7' },
    { head: '#8d5524', shirt: '#ffffff' },
    { head: '#fbb083', shirt: '#dc2626' },
    { head: '#f5c6a5', shirt: '#2563eb' },
  ];

  return (
    <div className={`flex items-end justify-between px-2 w-full h-7 overflow-hidden select-none ${jumpClass}`}>
      {fans.map((fan, i) => (
        <svg key={i} viewBox="0 0 8 10" className="w-4 h-6 pixelated">
          <rect x="2" y="1" width="4" height="3" fill={fan.head} />
          <rect x="1" y="4" width="6" height="6" fill={fan.shirt} />
          {excitement !== 'low' && (
            <>
              <rect x="0" y="2" width="1" height="3" fill={fan.head} />
              <rect x="7" y="2" width="1" height="3" fill={fan.head} />
            </>
          )}
        </svg>
      ))}
    </div>
  );
}

// Vertical Side Stands (Left & Right Flanks)
export function PixelCrowdSide({ side = 'left', excitement = 'low' }) {
  const jumpClass =
    excitement === 'topBins' ? 'animate-bounce' : excitement === 'high' ? 'animate-pulse' : '';

  const sideFans = [
    { head: '#fbb083', shirt: '#dc2626' },
    { head: '#8d5524', shirt: '#2563eb' },
    { head: '#e0a97a', shirt: '#facc15' },
    { head: '#f5c6a5', shirt: '#16a34a' },
    { head: '#c68642', shirt: '#9333ea' },
    { head: '#fbb083', shirt: '#0284c7' },
    { head: '#8d5524', shirt: '#ea580c' },
    { head: '#e0a97a', shirt: '#ffffff' },
  ];

  return (
    <div className={`w-5 h-full flex flex-col justify-around items-center py-2 bg-[#0a180e] select-none ${jumpClass}`}>
      {sideFans.map((fan, i) => (
        <svg key={i} viewBox="0 0 8 8" className="w-3.5 h-4 pixelated">
          <rect x="2" y="0" width="4" height="3" fill={fan.head} />
          <rect x="1" y="3" width="6" height="5" fill={fan.shirt} />
        </svg>
      ))}
    </div>
  );
}