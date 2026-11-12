// src/components/MoonPhase.tsx

interface Props {
  illumination: number;

  phaseAngle: number;
}

export default function MoonPhase({
  illumination,

  phaseAngle,
}: Props) {
  const light = Math.max(0, Math.min(100, illumination));

  const shadow = 100 - light;

  return (
    <div className="moon-phase">
      <div
        className="moon-real"
        style={{
          background: `
linear-gradient(
${phaseAngle}deg,
#050505 ${shadow}%,
#f5e6a8 ${shadow + 5}%
)

`,
        }}
      >
        <div className="moon-craters" />
      </div>
    </div>
  );
}
