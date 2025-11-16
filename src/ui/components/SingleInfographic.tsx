import {
  OverlaySettings,
  OverlayMetrics,
  getOverlayLabelAndValue,
} from "../../types/overlay";
import { motion } from "framer-motion";
import styles from "../styles/SingleInfographic.module.css";

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
    <div className={styles.container}>
      {/* Number + unit */}
      {!isClock ? (
        <div className={styles.numberContainer}>
          {/* Main numeric value */}
          <motion.span
            key={valueNumber}
            className={styles.number}
            style={{
              fontSize: `${numberSize}px`,
              color: numberColor,
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {valueNumber}
          </motion.span>

          {/* Temperature unit (°) with manual visual offset */}
          {valueUnit && valueUnitType === "temp" && (
            <span className={styles.unitContainer}>
              <span
                className={styles.unit}
                style={{
                  fontSize: `${unitSize}px`,
                  color: numberColor,
                }}
              >
                {valueUnit}
              </span>
            </span>
          )}

          {/* Percentage unit (%) baseline-aligned */}
          {valueUnit && valueUnitType === "percent" && (
            <span
              className={styles.unitPercent}
              style={{
                fontSize: `${unitSize}px`,
                color: numberColor,
              }}
            >
              {valueUnit}
            </span>
          )}
        </div>
      ) : (
        <>
          {/* Clock number */}
          <motion.div
            key={valueNumber}
            className={styles.clockNumber}
            style={{
              fontSize: `${numberSize}px`,
              color: numberColor,
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {valueNumber}
          </motion.div>

          {/* MHz label below */}
          <div
            className={styles.clockLabel}
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
        className={styles.label}
        style={{
          fontSize: `${overlay.textSize * scale}px`,
          color: textColor,
        }}
      >
        {label}
      </div>
    </div>
  );
}
