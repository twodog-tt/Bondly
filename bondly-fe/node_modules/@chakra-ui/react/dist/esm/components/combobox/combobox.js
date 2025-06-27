"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import { Combobox, useComboboxContext } from '@ark-ui/react/combobox';
import { forwardRef } from 'react';
import { cx } from '../../utils/cx.js';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';
import { chakra } from '../../styled-system/factory.js';
import { ChevronDownIcon, CloseIcon, CheckIcon } from '../icons.js';

const {
  withProvider,
  withContext,
  useStyles: useComboboxStyles,
  useClassNames,
  PropsProvider
} = createSlotRecipeContext({ key: "combobox" });
const ComboboxRootProvider = withProvider(Combobox.RootProvider, "root", {
  forwardAsChild: true
});
const ComboboxRoot = withProvider(
  Combobox.Root,
  "root",
  { forwardAsChild: true }
);
const ComboboxPropsProvider = PropsProvider;
const ComboboxTrigger = withContext(Combobox.Trigger, "trigger", {
  forwardAsChild: true,
  forwardProps: ["focusable"],
  defaultProps: {
    children: /* @__PURE__ */ jsx(ChevronDownIcon, {})
  }
});
const ComboboxPositioner = withContext(Combobox.Positioner, "positioner", { forwardAsChild: true });
const ComboboxContent = withContext(Combobox.Content, "content", { forwardAsChild: true });
const ComboboxInput = withContext(
  Combobox.Input,
  "input",
  { forwardAsChild: true }
);
const ComboboxClearTrigger = withContext(Combobox.ClearTrigger, "clearTrigger", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsx(CloseIcon, {})
  }
});
const ComboboxIndicatorGroup = withContext("div", "indicatorGroup");
const ComboboxItemGroup = withContext(Combobox.ItemGroup, "itemGroup", { forwardAsChild: true });
const ComboboxItemGroupLabel = withContext(Combobox.ItemGroupLabel, "itemGroupLabel", { forwardAsChild: true });
const ComboboxItem = withContext(
  Combobox.Item,
  "item",
  { forwardAsChild: true }
);
const ComboboxItemText = withContext(Combobox.ItemText, "itemText", { forwardAsChild: true });
const ComboboxItemIndicator = withContext(Combobox.ItemIndicator, "itemIndicator", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsx(CheckIcon, {})
  }
});
const ComboboxControl = withContext(Combobox.Control, "control", { forwardAsChild: true });
const ComboboxLabel = withContext(
  Combobox.Label,
  "label",
  { forwardAsChild: true }
);
const ComboboxEmpty = forwardRef(
  function ComboboxEmpty2(props, ref) {
    const combobox = useComboboxContext();
    const styles = useComboboxStyles();
    const classNames = useClassNames();
    if (combobox.collection.size !== 0) return null;
    return /* @__PURE__ */ jsx(
      chakra.div,
      {
        ref,
        ...props,
        role: "presentation",
        "data-scope": "combobox",
        "data-part": "empty",
        className: cx(classNames.empty, props.className),
        css: [styles.empty, props.css]
      }
    );
  }
);
const ComboboxContext = Combobox.Context;
const ComboboxItemContext = Combobox.ItemContext;

export { ComboboxClearTrigger, ComboboxContent, ComboboxContext, ComboboxControl, ComboboxEmpty, ComboboxIndicatorGroup, ComboboxInput, ComboboxItem, ComboboxItemContext, ComboboxItemGroup, ComboboxItemGroupLabel, ComboboxItemIndicator, ComboboxItemText, ComboboxLabel, ComboboxPositioner, ComboboxPropsProvider, ComboboxRoot, ComboboxRootProvider, ComboboxTrigger, useComboboxStyles };
