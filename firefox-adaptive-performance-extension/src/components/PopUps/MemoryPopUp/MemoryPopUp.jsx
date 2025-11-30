import * as Popover from "@radix-ui/react-popover";
import styles from "./MemoryPopUp.module.css";
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
    variant: "medium",
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
    variant: "medium",
  },
});

export default function MemoryPopUp({ variant = "medium" }) {
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
          side="center"
          align="center"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {variant === "high" && (
            <div>
              <p>
                <LuInfo /> <br />
                Memory usage: <br />
                <span className={styles.levelHigh}>HIGH</span>
              </p>
              <ul>
                <li>
                  <IoWarning color="#E02950" />
                  Slow Performance
                </li>
                <li>
                  <IoWarning color="#E02950" />
                  High Crash Risk
                </li>
                <li>
                  <IoWarning color="#E02950" />
                  Slow Reload Rate
                </li>
              </ul>
            </div>
          )}

          {variant === "medium" && (
            <div>
              <p>
                <LuInfo /> <br />
                Memory Usage: <br />
                <span className={styles.levelMedium}>MEDIUM</span>
              </p>
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
              <p>
                <LuInfo /> <br />
                Memory Usage: <br />
                <span className={styles.levelLow}>LOW</span>
              </p>
              <ul>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Smooth Performance
                </li>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Improved Battery Life
                </li>
                <li>
                  <FaCheckCircle color="#005E5D" />
                  Low Crash Risk
                </li>
              </ul>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
