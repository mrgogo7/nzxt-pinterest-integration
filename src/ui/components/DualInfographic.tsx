import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";
import { motion } from "framer-motion";
import styles from "../styles/DualInfographic.module.css";

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
        <div className={styles.numberContainer}>
          {/* Main numeric value */}
          <motion.span
            key={info.valueNumber}
            className={styles.number}
            style={{
              fontSize: `${numSize}px`,
              color: numColor,
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {info.valueNumber}
          </motion.span>

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
          <motion.div
            key={info.valueNumber}
            className={styles.clockNumber}
            style={{
              fontSize: `${numSize}px`,
              color: numColor,
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {info.valueNumber}
          </motion.div>

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

  const primaryIsClock = primaryInfo.valueUnitType === "clock";
  const secondaryIsClock = secondaryInfo.valueUnitType === "clock";

  // Primary/Divider offset (overlay.x and overlay.y)
  const primaryOffsetX = (overlay.x || 0) * scale;
  const primaryOffsetY = (overlay.y || 0) * scale;
  
  // Secondary offset (secondaryOffsetX and secondaryOffsetY)
  const secondaryOffsetX = (overlay.secondaryOffsetX || 0) * scale;
  const secondaryOffsetY = (overlay.secondaryOffsetY || 0) * scale;
  
  // Divider gap - space between primary and divider
  const dividerGap = (overlay.dividerGap || 27) * scale;

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

      {/* Left section: Primary metric - Attached to divider with gap */}
      <div
        className={styles.primarySection}
        style={{
          transform: `translate(calc(-100% - ${dividerGap}px + ${primaryOffsetX}px), calc(-50% + ${primaryOffsetY}px))`,
        }}
      >
        {renderMetric(primaryInfo, primaryIsClock, primaryUnitSize, primaryNumberSize, primaryNumberColor)}

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

      {/* Right section: Secondary metric - Independent offset */}
      <div
        className={styles.secondarySection}
        style={{
          transform: `translate(${secondaryOffsetX}px, calc(-50% + ${secondaryOffsetY}px))`,
        }}
      >
        {renderMetric(secondaryInfo, secondaryIsClock, secondaryUnitSize, secondaryNumberSize, secondaryNumberColor)}

        {/* Label */}
        <div
          className={styles.label}
          style={{
            fontSize: `${secondaryTextSize}px`,
            color: secondaryTextColor,
            marginTop: secondaryIsClock ? 0 : 4,
          }}
        >
          {secondaryInfo.label}
        </div>
      </div>
    </div>
  );
}

