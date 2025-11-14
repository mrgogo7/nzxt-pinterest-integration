import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";

/**
 * SingleInfographic
 * Renders a single NZXT-style infographic overlay on top of the LCD media.
 * This component is purely presentational and does not access localStorage or NZXT APIs.
 */
export default function SingleInfographic({
  overlay,
  metrics,
  scale = 1,
}: {
  overlay: OverlaySettings;
  metrics: OverlayMetrics;
  scale?: number; // Scale factor for preview (e.g., 200/640 = 0.3125)
}) {
  if (overlay.mode !== "single") return null;

  const key = overlay.primaryMetric;
  const value = metrics[key];

  const {
    label,
    valueNumber,
    valueUnit,
    valueUnitType,
  } = getOverlayLabelAndValue(key, value);

  const numberColor = overlay.numberColor;
  const textColor = overlay.textColor;

  const numberSize = overlay.numberSize * scale;
  const unitSize =
    valueUnitType === "temp"
      ? numberSize * 0.49
      : valueUnitType === "percent"
      ? numberSize * 0.35
      : numberSize * 0.2;

  const isClock = valueUnitType === "clock";

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        fontFamily: "nzxt-extrabold",
      }}
    >
      {/* Number + unit */}
      {!isClock ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            justifyContent: "center",
            lineHeight: 0.9,
          }}
        >
          {/* Main numeric value */}
          <span
            style={{
              fontSize: `${numberSize}px`,
              fontWeight: 700,
              color: numberColor,
            }}
          >
            {valueNumber}
          </span>

          {/* Temperature unit (°) with manual visual offset */}
          {valueUnit && valueUnitType === "temp" && (
            <span
              style={{
                display: "inline-flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                paddingLeft: 4,
                transform: "translateY(-65%)",
              }}
            >
              <span
                style={{
                  fontSize: `${unitSize}px`,
                  fontWeight: 700,
                  color: numberColor,
                  lineHeight: 1,
                }}
              >
                {valueUnit}
              </span>
            </span>
          )}

          {/* Percentage unit (%) baseline-aligned */}
          {valueUnit && valueUnitType === "percent" && (
            <span
              style={{
                fontSize: `${unitSize}px`,
                fontWeight: 700,
                color: numberColor,
                paddingLeft: 4,
                lineHeight: 1,
              }}
            >
              {valueUnit}
            </span>
          )}
        </div>
      ) : (
        <>
          {/* Clock number */}
          <div
            style={{
              fontSize: `${numberSize}px`,
              fontWeight: 700,
              color: numberColor,
              lineHeight: 0.9,
            }}
          >
            {valueNumber}
          </div>

          {/* MHz label below */}
          <div
            style={{
              fontSize: `${unitSize}px`,
              marginTop: -numberSize * 0.15,
              marginBottom: 6,
              color: numberColor,
            }}
          >
            MHz
          </div>
        </>
      )}

      {/* Label (CPU / GPU / Liquid) */}
      <div
        style={{
          fontSize: `${overlay.textSize * scale}px`,
          color: textColor,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
