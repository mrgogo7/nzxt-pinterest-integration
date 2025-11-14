import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";

/**
 * TripleInfographic
 * Renders three NZXT-style infographic overlays:
 * - Primary metric (left, large)
 * - Secondary and tertiary metrics (right, stacked vertically)
 * - Vertical divider line between left and right sections
 * Each metric has its own color, size, and label.
 * This component is purely presentational and does not access localStorage or NZXT APIs.
 */
export default function TripleInfographic({
  overlay,
  metrics,
  scale = 1,
}: {
  overlay: OverlaySettings;
  metrics: OverlayMetrics;
  scale?: number; // Scale factor for preview (e.g., 200/640 = 0.3125)
}) {
  if (overlay.mode !== "triple") return null;

  const primaryKey = overlay.primaryMetric;
  const secondaryKey = overlay.secondaryMetric || overlay.primaryMetric;
  const tertiaryKey = overlay.tertiaryMetric || overlay.primaryMetric;

  const primaryValue = metrics[primaryKey];
  const secondaryValue = metrics[secondaryKey];
  const tertiaryValue = metrics[tertiaryKey];

  const primaryInfo = getOverlayLabelAndValue(primaryKey, primaryValue);
  const secondaryInfo = getOverlayLabelAndValue(secondaryKey, secondaryValue);
  const tertiaryInfo = getOverlayLabelAndValue(tertiaryKey, tertiaryValue);

  const numberColor = overlay.numberColor;
  const textColor = overlay.textColor;

  // Primary metric uses full size, secondary/tertiary use smaller size
  const primaryNumberSize = overlay.numberSize * scale;
  const secondaryNumberSize = overlay.numberSize * scale * 0.6; // 60% of primary size
  const textSize = overlay.textSize * scale;
  const secondaryTextSize = overlay.textSize * scale * 0.7; // 70% of primary text size

  // Helper function to render a single metric value
  const renderMetric = (
    info: typeof primaryInfo,
    isClock: boolean,
    unitSize: number,
    numSize: number
  ) => {
    if (!isClock) {
      return (
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
              fontSize: `${numSize}px`,
              fontWeight: 700,
              color: numberColor,
            }}
          >
            {info.valueNumber}
          </span>

          {/* Temperature unit (°) with manual visual offset */}
          {info.valueUnit && info.valueUnitType === "temp" && (
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
                {info.valueUnit}
              </span>
            </span>
          )}

          {/* Percentage unit (%) baseline-aligned */}
          {info.valueUnit && info.valueUnitType === "percent" && (
            <span
              style={{
                fontSize: `${unitSize}px`,
                fontWeight: 700,
                color: numberColor,
                paddingLeft: 4,
                lineHeight: 1,
              }}
            >
              {info.valueUnit}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <>
          {/* Clock number */}
          <div
            style={{
              fontSize: `${numSize}px`,
              fontWeight: 700,
              color: numberColor,
              lineHeight: 0.9,
            }}
          >
            {info.valueNumber}
          </div>

          {/* MHz label below */}
          <div
            style={{
              fontSize: `${unitSize}px`,
              marginTop: -numSize * 0.15,
              marginBottom: 6,
              color: numberColor,
            }}
          >
            MHz
          </div>
        </>
      );
    }
  };

  const primaryUnitSize =
    primaryInfo.valueUnitType === "temp"
      ? primaryNumberSize * 0.49
      : primaryInfo.valueUnitType === "percent"
      ? primaryNumberSize * 0.35
      : primaryNumberSize * 0.2;

  const secondaryUnitSize =
    secondaryInfo.valueUnitType === "temp"
      ? secondaryNumberSize * 0.49
      : secondaryInfo.valueUnitType === "percent"
      ? secondaryNumberSize * 0.35
      : secondaryNumberSize * 0.2;

  const tertiaryUnitSize =
    tertiaryInfo.valueUnitType === "temp"
      ? secondaryNumberSize * 0.49
      : tertiaryInfo.valueUnitType === "percent"
      ? secondaryNumberSize * 0.35
      : secondaryNumberSize * 0.2;

  const primaryIsClock = primaryInfo.valueUnitType === "clock";
  const secondaryIsClock = secondaryInfo.valueUnitType === "clock";
  const tertiaryIsClock = tertiaryInfo.valueUnitType === "clock";

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        inset: 0,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: primaryNumberSize * 0.2, // Space between left and right sections
        pointerEvents: "none",
        fontFamily: "nzxt-extrabold",
      }}
    >
      {/* Left section: Primary metric (large) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        {renderMetric(
          primaryInfo,
          primaryIsClock,
          primaryUnitSize,
          primaryNumberSize
        )}

        {/* Label */}
        <div
          style={{
            fontSize: `${textSize}px`,
            color: textColor,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: primaryIsClock ? 0 : 4,
          }}
        >
          {primaryInfo.label}
        </div>
      </div>

      {/* Vertical divider line */}
      <div
        style={{
          width: 2,
          height: "60%",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          borderRadius: 1,
        }}
      />

      {/* Right section: Secondary and tertiary metrics (stacked) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: secondaryNumberSize * 0.4, // Space between secondary and tertiary
          flex: 1,
        }}
      >
        {/* Secondary metric (top) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderMetric(
            secondaryInfo,
            secondaryIsClock,
            secondaryUnitSize,
            secondaryNumberSize
          )}

          {/* Label */}
          <div
            style={{
              fontSize: `${secondaryTextSize}px`,
              color: textColor,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginTop: secondaryIsClock ? 0 : 2,
            }}
          >
            {secondaryInfo.label}
          </div>
        </div>

        {/* Tertiary metric (bottom) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderMetric(
            tertiaryInfo,
            tertiaryIsClock,
            tertiaryUnitSize,
            secondaryNumberSize
          )}

          {/* Label */}
          <div
            style={{
              fontSize: `${secondaryTextSize}px`,
              color: textColor,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginTop: tertiaryIsClock ? 0 : 2,
            }}
          >
            {tertiaryInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}

