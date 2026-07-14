"use client";

import { useActionState, useState } from "react";
import { XIcon } from "lucide-react";
import { createMapPin, updateMapPin } from "@/app/actions";
import { MAP_PIN_TYPES } from "@/lib/mapPinTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Shared by both "add a pin" (after a map click drops a temporary marker --
// see NeighborhoodMap.js) and "edit my pin" (opened from a pin's own
// popup). The caller is expected to remount this with a fresh `key` (e.g.
// `mode + (pin?.id ?? "new")`) whenever switching between add/edit or
// between two different pins, so useActionState always starts clean rather
// than showing a stale result from a previous open.
//
// Editing never offers a way to move the pin, only rename/redescribe/
// retype it -- see updateMapPin in src/app/actions.js, which doesn't
// accept lat/lng at all.
export default function PinForm({ open, onOpenChange, mode, pin, lat, lng, onSaved }) {
  const action = mode === "edit" ? updateMapPin.bind(null, pin.id) : createMapPin;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState(mode === "edit" ? pin.type : "");

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      onOpenChange(false);
      onSaved?.();
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form action={formAction} className="flex flex-col">
          {mode === "add" && (
            <>
              <input type="hidden" name="lat" value={lat} />
              <input type="hidden" name="lng" value={lng} />
            </>
          )}

          <DrawerHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <DrawerTitle className="text-lg font-semibold">
              {mode === "edit" ? "Edit pin" : "Add a pin"}
            </DrawerTitle>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon-sm" type="button" aria-label="Close" />
              }
            >
              <XIcon aria-hidden="true" />
            </DrawerClose>
          </DrawerHeader>

          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pinName">Name</Label>
              <Input
                id="pinName"
                name="name"
                required
                defaultValue={mode === "edit" ? pin.name : ""}
                placeholder="Little Free Library"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pinType">Type</Label>
              <Select name="type" value={type} onValueChange={setType} items={MAP_PIN_TYPES.map((t) => ({ value: t.value, label: t.value }))}>
                <SelectTrigger id="pinType" className="w-full">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {MAP_PIN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pinDescription">Description</Label>
              <Textarea
                id="pinDescription"
                name="description"
                rows={3}
                required
                defaultValue={mode === "edit" ? pin.description : ""}
                placeholder="What should neighbors know about this spot?"
              />
            </div>
          </div>

          <DrawerFooter className="flex flex-row items-center justify-end border-t border-border pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Add pin"}
            </Button>
          </DrawerFooter>
          {state?.error && (
            <p className="px-4 pb-4 text-sm text-destructive">{state.error}</p>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
