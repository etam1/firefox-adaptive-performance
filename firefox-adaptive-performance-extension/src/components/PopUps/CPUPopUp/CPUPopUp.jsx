import * as Popover from "@radix-ui/react-popover";
import styles from "./CPUPopUp.module.css";
import React, { useState } from "react";
import { cva } from "class-variance-authority";
import { LuInfo } from "react-icons/lu";
import { IoWarning } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

const popUpStyle = cva(styles.popUpBase, {
  variants: {
    variant: {
      high: styles.popUpHigh,
      medium: styles.popUpMedium,
      low: styles.popUpLow,
    },
  },
  defaultVariants: {
    variant: "low",
  },
});

const popoverContentStyle = cva(styles.popoverContent, {
  variants: {
    variant: {
      high: styles.contentHigh,
      medium: styles.contentMedium,
      low: styles.contentLow,
    },
  },
  defaultVariants: {
    variant: "low",
  },
});

export default function CPUPopUp({ variant = "low" }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          className={popUpStyle({ variant })}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <LuInfo />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className={popoverContentStyle({ variant })}
          side="right"
          align="center"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {variant === "high" && (
            <div>
              <div className={styles.title}>
                <LuInfo />
                <span>CPU usage:</span>
                <span className={styles.levelHigh}>HIGH</span>
              </div>
              <ul>
                <li>
                  <IoWarning color="#E02950" />
                  Device Overheating
                </li>
                <li>
                  <IoWarning color="#E02950" />
                  Rapid Battery Drain
                </li>
                <li>
                  <IoWarning color="#E02950" />
                  High Crash Risk
                </li>
              </ul>
            </div>
          )}

          {variant === "medium" && (
            <div>
              <div className={styles.title}>
                <LuInfo />
                <span>CPU usage:</span>
                <span className={styles.levelMedium}>MEDIUM</span>
              </div>
              <ul>
                <li>
                  <IoWarning color="#FFBD4F" />
                  Reduced Efficiency
                </li>
                <li>
                  <IoWarning color="#FFBD4F" />
                  Slow Performance
                </li>
              </ul>
            </div>
          )}

          {variant === "low" && (
            <div>
              <div className={styles.title}>
                <LuInfo />
                <span>CPU usage:</span>
                <span className={styles.levelText}>LOW</span>
              </div>
              <ul>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Longer Battery Life
                </li>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Faster Performance
                </li>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Cooler Device
                </li>
              </ul>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
