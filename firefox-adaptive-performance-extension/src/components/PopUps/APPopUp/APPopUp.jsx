import * as Popover from "@radix-ui/react-popover";
import styles from "./APPopUp.module.css";
import React, { useState } from "react";
import { cva } from "class-variance-authority";
import { LuInfo } from "react-icons/lu";
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
    variant: "on",
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
    variant: "on",
  },
});

export default function APPopUp({ variant = "on" }) {
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
          sideOffset={16}
          alignOffset={-8}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {variant === "on" && (
            <div>
              <div className={styles.title}>
                <LuInfo />
                <span>Adaptive Performance:</span>
                <span className={styles.level}>ON</span>
              </div>
              <ul>
                <li>
                  <FaCheckCircle color="#0161DF" />
                  23% Memory Saved
                </li>
                <li>
                  <FaCheckCircle color="#0161DF" />
                  23% CPU Saved
                </li>
                <li>
                  <FaCheckCircle color="#0161DF" />
                  Auto-Sleep Tabs (5 Mins)
                </li>
                <li>
                  <FaCheckCircle color="#0161DF" />
                  Graphics Saved
                </li>
                <li>
                  <FaCheckCircle color="#0161DF" />
                  Garbage Collection
                </li>
              </ul>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
