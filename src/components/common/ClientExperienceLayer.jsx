import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMotionSafe } from "../../hooks/useMotionSafe";
import { readUserSettings } from "../../utils/userSettings";

const MotionDiv = motion.div;
const ClientExperienceLayer = ({ user }) => {
  const motionSafe = useMotionSafe();
  const userId = user?.id || "guest";
  const [isAmbientMotionEnabled, setIsAmbientMotionEnabled] = useState(
    () => readUserSettings(userId).enableAmbientMotion,
  );

  useEffect(() => {
    setIsAmbientMotionEnabled(readUserSettings(userId).enableAmbientMotion);
  }, [userId]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const changedUserId = String(event?.detail?.userId || "guest");
      if (changedUserId !== String(userId)) {
        return;
      }

      setIsAmbientMotionEnabled(
        Boolean(event?.detail?.settings?.enableAmbientMotion),
      );
    };

    const handleStorage = () => {
      setIsAmbientMotionEnabled(readUserSettings(userId).enableAmbientMotion);
    };

    window.addEventListener("app:settings-changed", handleSettingsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app:settings-changed", handleSettingsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  const blobs = useMemo(
    () => [
      {
        className:
          "absolute -left-14 top-24 h-44 w-44 rounded-full bg-cyan-200/30 blur-2xl",
        animate: { y: [0, 16, -8, 0], x: [0, 8, -4, 0] },
        transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
      },
      {
        className:
          "absolute right-18 top-44 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl",
        animate: { y: [0, -10, 12, 0], x: [0, -8, 4, 0] },
        transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
      },
      {
        className:
          "absolute bottom-12 left-[38%] h-40 w-40 rounded-full bg-teal-200/25 blur-2xl",
        animate: { y: [0, 12, -10, 0], x: [0, -4, 6, 0] },
        transition: { duration: 14, repeat: Infinity, ease: "easeInOut" },
      },
    ],
    [],
  );

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {blobs.map((blob, index) => (
          <MotionDiv
            key={`ambient-blob-${index}`}
            className={blob.className}
            {...motionSafe({
              animate: isAmbientMotionEnabled ? blob.animate : { opacity: 0 },
              transition: blob.transition,
            })}
          />
        ))}
      </div>
    </>
  );
};

export default ClientExperienceLayer;
