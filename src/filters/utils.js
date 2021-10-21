import {PluginKey} from 'prosemirror-state';
import {columnTypesMap, types} from '../columnsTypes/types.config';
import {getColIndex} from '../util';

export const tableFiltersMenuKey = new PluginKey('TableFiltersMenu');

export const generateMenuPopup = () => {
  const menuElement = document.createElement('div');
  menuElement.className = `tableFiltersMenu`;
  menuElement.dataset.test = `table-filters-menu`;
  menuElement.style.display = 'none';
  menuElement.style.position = 'absolute';
  menuElement.style.zIndex = '200';

  return menuElement;
};

export const displayPopup = (view, popupDOM) => {
  const menuData = tableFiltersMenuKey.getState(view.state);

  if (menuData) {
    popupDOM.style.display = 'flex';
    return menuData;
  }

  return null;
};

export const calculateMenuPosition = (menuDOM, {node, dom: tableDOM, pos}) => {
  const {style} = menuDOM;
  const {left, height: cellHeight, top} = tableDOM.getBoundingClientRect();

  if (left === 0 || top === 0 || cellHeight === 0) return;

  // scroll offset
  const [scrolledEl] = document.getElementsByClassName('czi-editor-frame-body');
  const {x: EDITOR_LEFT_OFFSET, y: EDITOR_TOP_OFFSET} =
    scrolledEl.getBoundingClientRect();

  style.top = `${top - EDITOR_TOP_OFFSET + (scrolledEl.scrollTop || 0) + 8}px`;
  style.left = `${left - EDITOR_LEFT_OFFSET - 8}px`;
};

export const createDefaultFilter = (table) => {
  const firstColHeader = table.firstChild.firstChild;

  const {type: headerType} = firstColHeader.attrs;
  const typeConfig = types.find((type) => type.id === headerType);
  const typeFirstFilter = typeConfig.filters.find((filter) => filter.default);

  return {
    headerId: firstColHeader.attrs.id,
    filterId: typeFirstFilter.id,
    filterValue: typeFirstFilter.defaultValue,
  };
};

export const getColsOptions = (table) => {
  const headersRow = table.firstChild;
  const headers = headersRow.content.content.map((headerNode) => {
    return {
      label: headerNode.textContent.length
        ? headerNode.textContent
        : 'Untitled',
      value: headerNode.attrs.id,
      className: `colItem ${headerNode.attrs.type}Type`,
      onSelect: () => {},
    };
  });
  return headers;
};

export const updateTableFilters = (table, tablePos, view, newFilters) => {
  const {tr} = view.state;
  tr.setNodeMarkup(tablePos - 1, undefined, {filters: newFilters});

  view.dispatch(tr);
};

const filterColumn = (tableRows, colIndex, colType, filters) => {
  const colCells = tableRows.map((row) => row.node.child(colIndex));

  filters.forEach((filter) => {
    const filterLogic = colType.filters.find(
      (filterConfig) => filterConfig.id === filter.filterId
    ).logic;

    colCells.forEach((cell, rowIndex) => {
      if (!filterLogic(cell, filter.filterValue)) {
        tableRows[rowIndex].hidden = true;
      }
    });
  });
};

export const executeFilters = (table, tablePos, view, filters) => {
  // order filters by columns
  const filtersByHeaderId = {};
  filters.forEach((filter) => {
    if (!filtersByHeaderId[filter.headerId])
      filtersByHeaderId[filter.headerId] = [];
    filtersByHeaderId[filter.headerId].push(filter);
  });

  const headersRow = table.firstChild;
  const tableRows = [];

  // get all rows and their pos
  table.descendants((node, pos, parent) => {
    if (parent.type.name !== 'table') return false; // go over the rows only and not their content
    tableRows.push({node, pos: pos + tablePos, hidden: false});
    return false;
  });

  tableRows.splice(0, 1); // remove headers row

  // apply filters on each column
  headersRow.descendants((header, pos, parent) => {
    if (parent.type.name !== 'table_row') return false; // go over the headers only and not their content

    const colType = columnTypesMap[header.attrs.type];
    const colIndex = getColIndex(view.state, pos + tablePos + 1);

    if (Object.keys(filtersByHeaderId).includes(header.attrs.id)) {
      filterColumn(
        tableRows,
        colIndex,
        colType,
        filtersByHeaderId[header.attrs.id]
      );
    }
    return false;
  });

  const {tr} = view.state;

  tableRows.forEach((row) => {
    if (row.hidden) {
      tr.setNodeMarkup(row.pos, undefined, {hidden: true});
    } else {
      tr.setNodeMarkup(row.pos, undefined, {hidden: false});
    }
  });

  view.dispatch(tr);
};
