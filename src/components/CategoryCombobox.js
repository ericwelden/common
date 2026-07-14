"use client";

import { RECOMMENDATION_CATEGORIES } from "@/lib/recommendationCategories";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

const ALL_VALUE = "all";
const ALL_LABEL = "All categories";

function toLabel(item) {
  return item === ALL_VALUE ? ALL_LABEL : item;
}

// Shared by the recs-list category filter and the new-recommendation form's
// category field -- typing filters the list (Base UI's own built-in match,
// see the function-child on ComboboxList below), and the popup hugs its
// content width rather than stretching to match whatever width the trigger
// happens to be.
export default function CategoryCombobox({
  value,
  onValueChange,
  includeAllOption = false,
  name,
  id,
  placeholder = "Choose a category",
  className,
}) {
  const items = includeAllOption ? [ALL_VALUE, ...RECOMMENDATION_CATEGORIES] : RECOMMENDATION_CATEGORIES;

  return (
    <Combobox
      items={items}
      value={value}
      onValueChange={onValueChange}
      name={name}
      itemToStringLabel={toLabel}
    >
      <ComboboxInput id={id} placeholder={placeholder} className={className} />
      <ComboboxContent className="w-max">
        <ComboboxEmpty>No matches</ComboboxEmpty>
        {/* A function child, not a manual .map() over the full items array --
            that's what makes this render Base UI's actually-filtered list
            instead of a static copy of everything. */}
        <ComboboxList className="max-h-[17rem]">
          {(item) => <ComboboxItem key={item} value={item}>{toLabel(item)}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
