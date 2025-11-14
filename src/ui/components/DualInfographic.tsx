import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";

/**
 * DualInfographic
 * Renders two NZXT-style infographic overlays side by side.
 * Each metric has its own color, size, and label.
 * This component is purely presentational and does not access localStorage or NZXT APIs.
 */
export default function DualInfographic({
  overlay,
  metrics,
  scale = 1,
}: {
  overlay: OverlaySettings;
  metrics: OverlayMetrics;
  scale?: number; // Scale factor for preview (e.g., 200/640 = 0.3125)
}) {
  if (overlay.mode !== "dual") return null;

  const primaryKey = overlay.primaryMetric;
  const secondaryKey = overlay.secondaryMetric || overlay.primaryMetric;

  const primaryValue = metrics[primaryKey];
  const secondaryValue = metrics[secondaryKey];

  const primaryInfo = getOverlayLabelAndValue(primaryKey, primaryValue);
  const secondaryInfo = getOverlayLabelAndValue(secondaryKey, secondaryValue);

  // Use separate colors for primary and secondary in dual mode
  const primaryNumberColor = overlay.primaryNumberColor || overlay.numberColor;
  const primaryTextColor = overlay.primaryTextColor || overlay.textColor;
  const secondaryNumberColor = overlay.secondaryNumberColor || overlay.numberColor;
  const secondaryTextColor = overlay.secondaryTextColor || overlay.textColor;

  // Use separate sizes for primary and secondary in dual mode
  const primaryNumberSize = overlay.numberSize * scale;
  const primaryTextSize = overlay.textSize * scale;
  const secondaryNumberSize = (overlay.secondaryNumberSize || overlay.numberSize) * scale;
  const secondaryTextSize = (overlay.secondaryTextSize || overlay.textSize) * scale;

  // Helper function to render a single metric value
  const renderMetric = (
    info: typeof primaryInfo,
    isClock: boolean,
    unitSize: number,
    numSize: number,
    numColor: string
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
              color: numColor,
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
                  color: numColor,
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
                color: numColor,
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
              color: numColor,
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
              color: numColor,
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

  const primaryIsClock = primaryInfo.valueUnitType === "clock";
  const secondaryIsClock = secondaryInfo.valueUnitType === "clock";

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
        gap: overlay.gap ? `${overlay.gap * scale}px` : `${primaryNumberSize * 0.3}px`, // Space between two metrics (configurable)
        pointerEvents: "none",
        fontFamily: "nzxt-extrabold",
      }}
    >
      {/* Primary metric (left) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderMetric(primaryInfo, primaryIsClock, primaryUnitSize, primaryNumberSize, primaryNumberColor)}

        {/* Label */}
        <div
          style={{
            fontSize: `${primaryTextSize}px`,
            color: primaryTextColor,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: primaryIsClock ? 0 : 4,
          }}
        >
          {primaryInfo.label}
        </div>
      </div>

      {/* Divider (optional) */}
      {overlay.showDivider && (
        <div
          style={{
            width: `${overlay.dividerThickness || 2}px`,
            height: `${overlay.dividerWidth || 60}%`,
            backgroundColor: primaryNumberColor,
            opacity: 0.3,
            borderRadius: 1,
          }}
        />
      )}

      {/* Secondary metric (right) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderMetric(secondaryInfo, secondaryIsClock, secondaryUnitSize, secondaryNumberSize, secondaryNumberColor)}

        {/* Label */}
        <div
          style={{
            fontSize: `${secondaryTextSize}px`,
            color: secondaryTextColor,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: secondaryIsClock ? 0 : 4,
          }}
        >
          {secondaryInfo.label}
        </div>
      </div>
    </div>
  );
}

