import { useEffect, useState } from "react";

import {
  calculateDistanceToKaaba,
  calculateQiblaDirection,
} from "../astronomy/qibla";

import { useLanguage } from "../context/LanguageContext";

interface Props {
  latitude: number;
  longitude: number;
}

interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventConstructorIOS {
  requestPermission?: () => Promise<"granted" | "denied">;
}

type CompassStatus =
  | "idle"
  | "active"
  | "waiting"
  | "denied"
  | "unsupported"
  | "error";

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function shortestAngle(angle: number): number {
  return ((angle + 540) % 360) - 180;
}

export default function QiblaCard({ latitude, longitude }: Props) {
  const { language, t } = useLanguage();

  const qiblaBearing = calculateQiblaDirection(latitude, longitude);

  const distance = calculateDistanceToKaaba(latitude, longitude);

  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  const [compassStatus, setCompassStatus] = useState<CompassStatus>("idle");

  useEffect(() => {
    if (compassStatus !== "active" && compassStatus !== "waiting") {
      return;
    }

    let receivedHeading = false;

    function handleOrientation(event: DeviceOrientationEvent) {
      const iosEvent = event as DeviceOrientationEventIOS;

      let heading: number | null = null;

      /*
       * iPhone / Safari.
       *
       * webkitCompassHeading is already
       * a compass heading:
       *
       * 0   = North
       * 90  = East
       * 180 = South
       * 270 = West
       */
      if (typeof iosEvent.webkitCompassHeading === "number") {
        heading = iosEvent.webkitCompassHeading;
      } else if (typeof event.alpha === "number") {

      /*
       * Other browsers.
       *
       * Only use alpha when the browser
       * provides orientation data.
       */
        heading = normalizeDegrees(360 - event.alpha);
      }

      if (heading === null) {
        return;
      }

      receivedHeading = true;

      setDeviceHeading(normalizeDegrees(heading));

      setCompassStatus("active");
    }

    /*
     * deviceorientationabsolute is preferable
     * when available because the heading is
     * intended to be relative to Earth.
     *
     * We also listen to deviceorientation
     * for Safari/iOS compatibility.
     */
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation as EventListener,
      true,
    );

    window.addEventListener("deviceorientation", handleOrientation, true);

    /*
     * Permission may succeed while the
     * device/browser supplies no sensor data.
     *
     * Don't call that "permission denied".
     */
    const timeout = window.setTimeout(() => {
      if (!receivedHeading) {
        setCompassStatus("waiting");
      }
    }, 2500);

    return () => {
      window.clearTimeout(timeout);

      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as EventListener,
        true,
      );

      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [compassStatus]);

  async function enableCompass() {
    setDeviceHeading(null);

    if (
      typeof window === "undefined" ||
      !("DeviceOrientationEvent" in window)
    ) {
      setCompassStatus("unsupported");
      return;
    }

    try {
      const orientationConstructor =
        DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorIOS;

      /*
       * iOS requires permission from
       * a direct user interaction.
       */
      if (typeof orientationConstructor.requestPermission === "function") {
        const permission = await orientationConstructor.requestPermission();

        if (permission !== "granted") {
          setCompassStatus("denied");
          return;
        }
      }

      setCompassStatus("waiting");
    } catch (error) {
      console.error("Compass activation failed:", error);

      setCompassStatus("error");
    }
  }

  function getDirectionName(degree: number) {
    if (degree >= 337.5 || degree < 22.5) {
      return t("north");
    }

    if (degree < 67.5) {
      return t("northEast");
    }

    if (degree < 112.5) {
      return t("east");
    }

    if (degree < 157.5) {
      return t("southEast");
    }

    if (degree < 202.5) {
      return t("south");
    }

    if (degree < 247.5) {
      return t("southWest");
    }

    if (degree < 292.5) {
      return t("west");
    }

    return t("northWest");
  }

  /*
   * Without live sensor data:
   *
   * the arrow shows Qibla relative
   * to geographic north.
   *
   * With live sensor data:
   *
   * the phone heading is removed
   * from the Qibla bearing.
   */
  const arrowRotation =
    deviceHeading === null
      ? qiblaBearing
      : shortestAngle(qiblaBearing - deviceHeading);

  const alignmentError =
    deviceHeading === null ? null : shortestAngle(qiblaBearing - deviceHeading);

  const isAligned = alignmentError !== null && Math.abs(alignmentError) <= 3;

  const needsActivation =
    compassStatus === "idle" ||
    compassStatus === "denied" ||
    compassStatus === "error";

  return (
    <div className="qibla-card">
      <h2>🕋 {t("qibla")}</h2>

      <div className="compass">
        <span className="direction north">N</span>

        <span className="direction east">E</span>

        <span className="direction south">S</span>

        <span className="direction west">W</span>

        <div
          className="qibla-arrow"
          style={{
            transform: `rotate(${arrowRotation}deg)`,
          }}
        >
          <span>↑</span>
        </div>

        <div className="kaaba-center">🕋</div>
      </div>

      <div className="qibla-degree">{qiblaBearing.toFixed(1)}°</div>

      <div className="qibla-direction">{getDirectionName(qiblaBearing)}</div>

      {compassStatus === "active" && deviceHeading !== null && (
        <div className="qibla-live-data">
          <div>
            🧭 {language === "ar" ? "اتجاه الجهاز" : "Device heading"}:{" "}
            <strong>{deviceHeading.toFixed(0)}°</strong>
          </div>

          <div>
            {isAligned ? (
              <strong>
                🕋 {language === "ar" ? "أنت في اتجاه القبلة" : "Facing Qibla"}
              </strong>
            ) : (
              <>
                {language === "ar" ? "الانحراف عن القبلة" : "Qibla offset"}:{" "}
                <strong>{Math.abs(alignmentError ?? 0).toFixed(0)}°</strong>
              </>
            )}
          </div>
        </div>
      )}

      {needsActivation && (
        <button
          type="button"
          className="qibla-compass-button"
          onClick={enableCompass}
        >
          🧭{" "}
          {compassStatus === "idle"
            ? language === "ar"
              ? "تشغيل البوصلة"
              : "Activate Compass"
            : language === "ar"
              ? "إعادة المحاولة"
              : "Try Again"}
        </button>
      )}

      {compassStatus === "waiting" && (
        <div className="qibla-compass-status">
          🧭{" "}
          {language === "ar"
            ? "حرّك الهاتف قليلًا لمعايرة البوصلة..."
            : "Move your phone slightly to calibrate the compass..."}
        </div>
      )}

      {compassStatus === "denied" && (
        <div className="qibla-compass-status">
          {language === "ar"
            ? "تم رفض إذن حساس الاتجاه. اسمح بالوصول إلى حساسات الحركة ثم أعد المحاولة."
            : "Orientation permission was denied. Allow motion sensors and try again."}
        </div>
      )}

      {compassStatus === "unsupported" && (
        <div className="qibla-compass-status">
          {language === "ar"
            ? "البوصلة الحية غير متاحة على هذا الجهاز. السهم يعرض القبلة بالنسبة للشمال."
            : "Live compass is unavailable on this device. The arrow shows Qibla relative to north."}
        </div>
      )}

      {compassStatus === "error" && (
        <div className="qibla-compass-status">
          {language === "ar"
            ? "تعذر تشغيل حساس الاتجاه. جرّب مرة أخرى من الهاتف."
            : "Could not start the orientation sensor. Try again on your phone."}
        </div>
      )}

      <div className="qibla-distance">
        <span>{t("distanceToKaaba")}</span>

        <strong>
          {distance.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}{" "}
          {t("km")}
        </strong>
      </div>
    </div>
  );
}
