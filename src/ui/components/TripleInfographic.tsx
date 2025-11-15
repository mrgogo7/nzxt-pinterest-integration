import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";
import styles from "../styles/TripleInfographic.module.css";

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

  // Use separate colors for primary, secondary, and tertiary in triple mode
  const primaryNumberColor = overlay.primaryNumberColor || overlay.numberColor;
  const primaryTextColor = overlay.primaryTextColor || overlay.textColor;
  const secondaryNumberColor = overlay.secondaryNumberColor || overlay.numberColor;
  const secondaryTextColor = overlay.secondaryTextColor || overlay.textColor;
  const tertiaryNumberColor = overlay.tertiaryNumberColor || overlay.numberColor;
  const tertiaryTextColor = overlay.tertiaryTextColor || overlay.textColor;

  // Use separate sizes for primary, secondary, and tertiary in triple mode
  const primaryNumberSize = overlay.numberSize * scale;
  const primaryTextSize = overlay.textSize * scale;
  const secondaryNumberSize = (overlay.secondaryNumberSize || overlay.numberSize * 0.6) * scale;
  const secondaryTextSize = (overlay.secondaryTextSize || overlay.textSize * 0.7) * scale;
  const tertiaryNumberSize = (overlay.tertiaryNumberSize || overlay.numberSize * 0.6) * scale;
  const tertiaryTextSize = (overlay.tertiaryTextSize || overlay.textSize * 0.7) * scale;

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
        <div className={styles.numberContainer}>
          {/* Main numeric value */}
          <span
            className={styles.number}
            style={{
              fontSize: `${numSize}px`,
              color: numColor,
            }}
          >
            {info.valueNumber}
          </span>

          {/* Temperature unit (°) with manual visual offset */}
          {info.valueUnit && info.valueUnitType === "temp" && (
            <span className={styles.unitContainer}>
              <span
                className={styles.unit}
                style={{
                  fontSize: `${unitSize}px`,
                  color: numColor,
                }}
              >
                {info.valueUnit}
              </span>
            </span>
          )}

          {/* Percentage unit (%) baseline-aligned */}
          {info.valueUnit && info.valueUnitType === "percent" && (
            <span
              className={styles.unitPercent}
              style={{
                fontSize: `${unitSize}px`,
                color: numColor,
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
            className={styles.clockNumber}
            style={{
              fontSize: `${numSize}px`,
              color: numColor,
            }}
          >
            {info.valueNumber}
          </div>

          {/* MHz label below */}
          <div
            className={styles.clockLabel}
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

  const tertiaryUnitSize =
    tertiaryInfo.valueUnitType === "temp"
      ? tertiaryNumberSize * 0.49
      : tertiaryInfo.valueUnitType === "percent"
      ? tertiaryNumberSize * 0.35
      : tertiaryNumberSize * 0.2;

  const primaryIsClock = primaryInfo.valueUnitType === "clock";
  const secondaryIsClock = secondaryInfo.valueUnitType === "clock";
  const tertiaryIsClock = tertiaryInfo.valueUnitType === "clock";

  // Primary/Divider offset (overlay.x and overlay.y)
  const primaryOffsetX = (overlay.x || 0) * scale;
  const primaryOffsetY = (overlay.y || 0) * scale;
  
  // Dual Readers offset (secondary/tertiary section)
  const dualReadersOffsetX = (overlay.dualReadersOffsetX || 0) * scale;
  const dualReadersOffsetY = (overlay.dualReadersOffsetY || 0) * scale;
  
  // Divider gap - space between primary and divider
  const dividerGap = (overlay.dividerGap || 8) * scale;

  return (
    <div className={styles.container}>
      {/* Vertical divider line - Always centered, moves with primary offset */}
      {overlay.showDivider && (
        <div
          className={styles.divider}
          style={{
            transform: `translate(calc(-50% + ${primaryOffsetX}px), calc(-50% + ${primaryOffsetY}px))`,
            width: `${overlay.dividerThickness || 2}px`,
            height: `${overlay.dividerWidth || 60}%`,
            backgroundColor: overlay.dividerColor || primaryNumberColor,
            opacity: overlay.dividerColor ? undefined : 0.3,
          }}
        />
      )}

      {/* Left section: Primary metric (large) - Attached to divider with gap */}
      <div
        className={styles.primarySection}
        style={{
          transform: `translate(calc(-100% - ${dividerGap}px + ${primaryOffsetX}px), calc(-50% + ${primaryOffsetY}px))`,
        }}
      >
        {renderMetric(
          primaryInfo,
          primaryIsClock,
          primaryUnitSize,
          primaryNumberSize,
          primaryNumberColor
        )}

        {/* Label */}
        <div
          className={styles.label}
          style={{
            fontSize: `${primaryTextSize}px`,
            color: primaryTextColor,
            marginTop: primaryIsClock ? 0 : 4,
          }}
        >
          {primaryInfo.label}
        </div>
      </div>

      {/* Right section: Secondary and tertiary metrics (stacked) - Dual Readers offset */}
      <div
        className={styles.dualReadersSection}
        style={{
          transform: `translate(${dualReadersOffsetX}px, calc(-50% + ${dualReadersOffsetY}px))`,
          gap: overlay.gapSecondaryTertiary ? `${overlay.gapSecondaryTertiary * scale}px` : `${secondaryNumberSize * 0.4}px`,
        }}
      >
        {/* Secondary metric (top) */}
        <div className={styles.metricContainer}>
          {renderMetric(
            secondaryInfo,
            secondaryIsClock,
            secondaryUnitSize,
            secondaryNumberSize,
            secondaryNumberColor
          )}

          {/* Label */}
          <div
            className={styles.label}
            style={{
              fontSize: `${secondaryTextSize}px`,
              color: secondaryTextColor,
              marginTop: secondaryIsClock ? 0 : 2,
            }}
          >
            {secondaryInfo.label}
          </div>
        </div>

        {/* Tertiary metric (bottom) */}
        <div className={styles.metricContainer}>
          {renderMetric(
            tertiaryInfo,
            tertiaryIsClock,
            tertiaryUnitSize,
            tertiaryNumberSize,
            tertiaryNumberColor
          )}

          {/* Label */}
          <div
            className={styles.label}
            style={{
              fontSize: `${tertiaryTextSize}px`,
              color: tertiaryTextColor,
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

