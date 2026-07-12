"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { venmoLink, cashAppLink, paypalLink } from "@/lib/paymentLinks";

const MAX_SUGGESTED = 100;

// Shown once, right after a reservation succeeds -- entirely optional, and
// this app never touches the money itself. Each button just opens a link
// to the owner's own Venmo/Cash App/PayPal with an amount pre-filled where
// that service supports it (see src/lib/paymentLinks.js); the actual
// transaction happens over there, not here.
export default function ThankOwnerPrompt({
  ownerName,
  venmoHandle,
  cashappHandle,
  paypalHandle,
  nights,
  suggestedDailyRate,
  onDismiss,
}) {
  const defaultAmount = Math.min(
    MAX_SUGGESTED,
    Math.max(0, Math.round(nights * (suggestedDailyRate ?? 0)))
  );
  const [amount, setAmount] = useState(defaultAmount);

  // Nothing to link to -- fall back to whatever happens when this prompt
  // isn't rendered at all (the caller only mounts this when there's at
  // least one handle, but staying defensive here costs nothing).
  if (!venmoHandle && !cashappHandle && !paypalHandle) return null;

  const note = "Thanks for lending this out — via Common";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">
          Your dates are booked
        </h2>
        <p className="text-sm text-muted-foreground">
          Want to send {ownerName} a thank-you?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-lg font-semibold text-foreground">
            ${amount}
          </span>
        </div>
        <Slider
          value={[amount]}
          onValueChange={([value]) => setAmount(value)}
          min={0}
          max={MAX_SUGGESTED}
          step={1}
          aria-label="Thank-you amount"
        />
      </div>

      <div className="flex flex-col gap-2">
        {venmoHandle && (
          <Button
            render={
              <a
                href={venmoLink(venmoHandle, amount, note)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Send ${amount} via Venmo
          </Button>
        )}
        {cashappHandle && (
          <Button
            variant="outline"
            render={
              <a
                href={cashAppLink(cashappHandle)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Open Cash App
          </Button>
        )}
        {paypalHandle && (
          <Button
            variant="outline"
            render={
              <a
                href={paypalLink(paypalHandle, amount)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Send ${amount} via PayPal
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-sm font-medium text-muted-foreground"
      >
        No thanks
      </button>
    </div>
  );
}
