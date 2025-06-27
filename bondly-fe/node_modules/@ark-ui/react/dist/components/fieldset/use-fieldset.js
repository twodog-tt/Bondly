'use client';
import { dataAttr } from '@zag-js/dom-query';
import { useRef, useId, useMemo } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useSafeLayoutEffect } from '../../utils/use-safe-layout-effect.js';
import { parts } from './fieldset.anatomy.js';

const useFieldset = (props = {}) => {
  const { disabled = false, invalid = false } = props;
  const env = useEnvironmentContext();
  const hasErrorText = useRef(false);
  const hasHelperText = useRef(false);
  const id = props.id ?? useId();
  const rootRef = useRef(null);
  const errorTextId = `fieldset::${id}::error-text`;
  const helperTextId = `fieldset::${id}::helper-text`;
  useSafeLayoutEffect(() => {
    const rootNode = rootRef.current;
    if (!rootNode) return;
    const checkTextElements = () => {
      const docOrShadowRoot = env.getRootNode();
      hasErrorText.current = !!docOrShadowRoot.getElementById(errorTextId);
      hasHelperText.current = !!docOrShadowRoot.getElementById(helperTextId);
    };
    checkTextElements();
    const win = env.getWindow();
    const observer = new win.MutationObserver(checkTextElements);
    observer.observe(rootNode, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [env, errorTextId, helperTextId]);
  const labelIds = useMemo(() => {
    const ids = [];
    if (hasErrorText.current && invalid) ids.push(errorTextId);
    if (hasHelperText.current) ids.push(helperTextId);
    return ids.join(" ") || void 0;
  }, [invalid, errorTextId, helperTextId]);
  const getRootProps = useMemo(
    () => () => ({
      ...parts.root.attrs,
      ref: rootRef,
      disabled,
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
      "aria-describedby": labelIds
    }),
    [disabled, invalid, labelIds]
  );
  const getLegendProps = useMemo(
    () => () => ({
      ...parts.legend.attrs,
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid)
    }),
    [disabled, invalid]
  );
  const getHelperTextProps = useMemo(
    () => () => ({
      id: helperTextId,
      ...parts.helperText.attrs
    }),
    [helperTextId]
  );
  const getErrorTextProps = useMemo(
    () => () => ({
      id: errorTextId,
      ...parts.errorText.attrs,
      "aria-live": "polite"
    }),
    [errorTextId]
  );
  return {
    refs: {
      rootRef
    },
    disabled,
    invalid,
    getRootProps,
    getLegendProps,
    getHelperTextProps,
    getErrorTextProps
  };
};

export { useFieldset };
