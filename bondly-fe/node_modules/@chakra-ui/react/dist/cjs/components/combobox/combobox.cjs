"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var combobox = require('@ark-ui/react/combobox');
var React = require('react');
var cx = require('../../utils/cx.cjs');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');
var factory = require('../../styled-system/factory.cjs');
var icons = require('../icons.cjs');

const {
  withProvider,
  withContext,
  useStyles: useComboboxStyles,
  useClassNames,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "combobox" });
const ComboboxRootProvider = withProvider(combobox.Combobox.RootProvider, "root", {
  forwardAsChild: true
});
const ComboboxRoot = withProvider(
  combobox.Combobox.Root,
  "root",
  { forwardAsChild: true }
);
const ComboboxPropsProvider = PropsProvider;
const ComboboxTrigger = withContext(combobox.Combobox.Trigger, "trigger", {
  forwardAsChild: true,
  forwardProps: ["focusable"],
  defaultProps: {
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronDownIcon, {})
  }
});
const ComboboxPositioner = withContext(combobox.Combobox.Positioner, "positioner", { forwardAsChild: true });
const ComboboxContent = withContext(combobox.Combobox.Content, "content", { forwardAsChild: true });
const ComboboxInput = withContext(
  combobox.Combobox.Input,
  "input",
  { forwardAsChild: true }
);
const ComboboxClearTrigger = withContext(combobox.Combobox.ClearTrigger, "clearTrigger", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.CloseIcon, {})
  }
});
const ComboboxIndicatorGroup = withContext("div", "indicatorGroup");
const ComboboxItemGroup = withContext(combobox.Combobox.ItemGroup, "itemGroup", { forwardAsChild: true });
const ComboboxItemGroupLabel = withContext(combobox.Combobox.ItemGroupLabel, "itemGroupLabel", { forwardAsChild: true });
const ComboboxItem = withContext(
  combobox.Combobox.Item,
  "item",
  { forwardAsChild: true }
);
const ComboboxItemText = withContext(combobox.Combobox.ItemText, "itemText", { forwardAsChild: true });
const ComboboxItemIndicator = withContext(combobox.Combobox.ItemIndicator, "itemIndicator", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.CheckIcon, {})
  }
});
const ComboboxControl = withContext(combobox.Combobox.Control, "control", { forwardAsChild: true });
const ComboboxLabel = withContext(
  combobox.Combobox.Label,
  "label",
  { forwardAsChild: true }
);
const ComboboxEmpty = React.forwardRef(
  function ComboboxEmpty2(props, ref) {
    const combobox$1 = combobox.useComboboxContext();
    const styles = useComboboxStyles();
    const classNames = useClassNames();
    if (combobox$1.collection.size !== 0) return null;
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.chakra.div,
      {
        ref,
        ...props,
        role: "presentation",
        "data-scope": "combobox",
        "data-part": "empty",
        className: cx.cx(classNames.empty, props.className),
        css: [styles.empty, props.css]
      }
    );
  }
);
const ComboboxContext = combobox.Combobox.Context;
const ComboboxItemContext = combobox.Combobox.ItemContext;

exports.ComboboxClearTrigger = ComboboxClearTrigger;
exports.ComboboxContent = ComboboxContent;
exports.ComboboxContext = ComboboxContext;
exports.ComboboxControl = ComboboxControl;
exports.ComboboxEmpty = ComboboxEmpty;
exports.ComboboxIndicatorGroup = ComboboxIndicatorGroup;
exports.ComboboxInput = ComboboxInput;
exports.ComboboxItem = ComboboxItem;
exports.ComboboxItemContext = ComboboxItemContext;
exports.ComboboxItemGroup = ComboboxItemGroup;
exports.ComboboxItemGroupLabel = ComboboxItemGroupLabel;
exports.ComboboxItemIndicator = ComboboxItemIndicator;
exports.ComboboxItemText = ComboboxItemText;
exports.ComboboxLabel = ComboboxLabel;
exports.ComboboxPositioner = ComboboxPositioner;
exports.ComboboxPropsProvider = ComboboxPropsProvider;
exports.ComboboxRoot = ComboboxRoot;
exports.ComboboxRootProvider = ComboboxRootProvider;
exports.ComboboxTrigger = ComboboxTrigger;
exports.useComboboxStyles = useComboboxStyles;
