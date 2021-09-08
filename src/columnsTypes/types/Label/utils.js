import * as nacl from 'tweetnacl';
import {encode as decodeUTF8} from '@stablelib/utf8';
import {encode as encodeBase64} from '@stablelib/base64';
import {findParentNodeOfTypeClosestToPos} from 'prosemirror-utils';

export const generateHash = (value) => {
  const buffer = decodeUTF8(value);
  const hashed = nacl.hash(buffer);
  const hashValue = encodeBase64(hashed);
  return hashValue;
};

export const stringToHash = (strToHash) => {
  // randomize so similar words have different colors
  let hash = 0;
  if (strToHash.length === 0) {
    return hash;
  }
  for (let i = 0; i < strToHash.length; i += 1) {
    const char = strToHash.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
};

export const stringToColor = (str, opacity = '1.0') => {
  const stringHash = generateHash(str);
  const numericalHash = stringToHash(stringHash);
  const shortened = numericalHash % 360;
  return `hsla(${shortened}, 68%, 48%, ${opacity})`;
};

export const addLabel = (view, pos, node, newLabel) => {
  const currentLabels = node.attrs.labels;

  const {tr} = view.state;

  const newAttrs = {
    ...node.attrs,
    labels: [...currentLabels, newLabel],
  };

  tr.replaceRangeWith(
    pos,
    pos + 1,
    view.state.schema.nodes.label.create(newAttrs)
  );
  updateTablesLabels(tr, pos, 'add', [newLabel]);

  view.dispatch(tr);
};

export const removeLabel = (view, pos, node, labelTitle) => {
  const currentLabels = node.attrs.labels;

  const {tr} = view.state;

  const newAttrs = {
    ...node.attrs,
    labels: currentLabels.filter((label) => label !== labelTitle),
  };

  tr.replaceRangeWith(
    pos,
    pos + 1,
    view.state.schema.nodes.label.create(newAttrs)
  );
  view.dispatch(tr);
};

export const updateTablesLabels = (tr, pos, action = 'add', newLabels) => {
  const table = findParentNodeOfTypeClosestToPos(
    tr.doc.resolve(pos),
    tr.doc.type.schema.nodes.table
  );

  if (!table) return;

  let newAttrs;

  if (action === 'add') {
    newAttrs = {
      ...table.node.attrs,
      labels: Array.from(new Set([...table.node.attrs.labels, ...newLabels])),
    };
  }
  if (action === 'remove') {
    newAttrs = {
      ...table.node.attrs,
      labels: table.node.attrs.labels.filter(
        (label) => !newLabels.includes(label)
      ),
    };
  }

  tr.setNodeMarkup(table.pos, undefined, newAttrs);
};

export const updateCellLabels = (view, pos, node, labels) => {
  const {tr} = view.state;

  const newAttrs = {
    ...node.attrs,
    labels,
  };

  tr.replaceRangeWith(
    pos,
    pos + 1,
    view.state.schema.nodes.label.create(newAttrs)
  );

  updateTablesLabels(tr, pos, 'add', labels);

  view.dispatch(tr);
};
