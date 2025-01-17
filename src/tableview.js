import {NodeSelection} from 'prosemirror-state';
import {addBottomRow, addRightColumn} from './commands';
import {createButtonWithIcon, createElementWithClass} from './util';
import {tableFiltersMenuKey} from './filters/utils';
import {tableHeadersMenuKey} from './columnsTypes/types.config';

const createAddCellsButton = (type, view) => {
  const isRow = type === 'row';
  const newElement = createElementWithClass(
    'button',
    `tableButton ${isRow ? 'tableAddBottomRow' : 'tableAddRightColumn'}`
  );
  newElement.innerHTML = '+';
  newElement.dataset.test = `${
    isRow ? 'tableAddBottomRow' : 'tableAddRightColumn'
  }`;
  newElement.contentEditable = false;
  newElement.onclick = () => {
    (isRow ? addBottomRow : addRightColumn)(view.state, view.dispatch);
    view.focus();
  };
  return newElement;
};

export class TableView {
  constructor(node, cellMinWidth, view, getPos) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.cellMinWidth = cellMinWidth;
    this.activeFiltersBtn = null;
    const tableScrollWrapper = createElementWithClass(
      'div',
      'tableScrollWrapper'
    );
    this.tableWrapper = tableScrollWrapper.appendChild(
      createElementWithClass('div', 'tableWrapper')
    );
    this.dom = tableScrollWrapper;
    this.dom.dataset.test = 'table-wrapper';

    this.tableHandle = createElementWithClass('div', 'tableHandle');
    this.tableHandle.dataset.test = 'table-handle';
    this.tableHorizontalWrapper = createElementWithClass(
      'div',
      'tableHorizontalWrapper'
    );
    this.tableVerticalWrapper = createElementWithClass(
      'div',
      'tableVerticalWrapper'
    );

    this.tableHandle.onclick = (e) => this.selectTable(e);
    this.tableHandle.onmousedown = (e) => e.preventDefault();
    this.tableHandle.contentEditable = false;

    this.tableWrapper.appendChild(this.tableHandle);
    this.tableWrapper.appendChild(this.tableHorizontalWrapper);
    this.tableHorizontalWrapper.appendChild(this.tableVerticalWrapper);

    this.table = this.tableVerticalWrapper.appendChild(
      document.createElement('table')
    );
    setTimeout(() => {
      this.updateMarkers();
    }, 0);
    if (this.view.editable) {
      this.tableVerticalWrapper.appendChild(createAddCellsButton('row', view));
      this.tableHorizontalWrapper.appendChild(
        createAddCellsButton('column', view)
      );
    }

    this.colgroup = this.table.appendChild(document.createElement('colgroup'));
    updateColumns(node, this.colgroup, this.table, cellMinWidth);
    this.contentDOM = this.table.appendChild(document.createElement('tbody'));

    this.buildActiveFiltersButton(node);
  }

  updateMarkers() {
    const rowMarkers = this.table.querySelectorAll('.addRowAfterMarker');

    rowMarkers.forEach((marker) => {
      marker.style = `width: ${this.table.offsetWidth + 15}px`;
    });

    const colMarkers = this.table.querySelectorAll('.addColAfterMarker');

    colMarkers.forEach((marker) => {
      marker.style = `height: ${this.table.offsetHeight + 15}px`;
    });
  }

  selectTable(e) {
    const {tr} = this.view.state;
    tr.setSelection(NodeSelection.create(tr.doc, this.getPos()));
    this.view.dispatch(tr);

    e.preventDefault();
  }

  buildActiveFiltersButton(node) {
    if (!this.activeFiltersBtn) {
      this.filterStatusIndicator = createElementWithClass(
        'div',
        'filterStatusIndicator'
      );
      this.filterStatusIndicatorScrollContainer = createElementWithClass(
        'div',
        'filterStatusIndicatorScrollContainer'
      );
      this.filterStatusIndicatorScrollContainer.appendChild(
        this.filterStatusIndicator
      );

      this.activeFiltersBtn = createButtonWithIcon('active-filters');

      this.activeFiltersBtn.dataset.test = 'add-filter';

      this.activeFiltersBtn.lastChild.innerText = 'filters';

      this.activeFiltersBtn.lastChild.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      this.filterStatusIndicator.appendChild(this.activeFiltersBtn);

      this.activeFiltersBtn.onclick = (e) => {
        const {dispatch} = this.view;
        const {tr} = this.view.state;
        // TODO: Create util that open the filter popup and close other - reuse
        if (!tableFiltersMenuKey.getState(this.view.state)) {
          tr.setMeta(tableFiltersMenuKey, {
            action: 'open',
            dom: this.contentDOM,
            pos: this.getPos() + 1,
            node: node,
            id: window.id
          });
        } else {
          tr.setMeta(tableFiltersMenuKey, {
            action: 'close',
            id: window.id
          });
        }

        tr.setMeta(tableHeadersMenuKey, {
          action: 'close',
          id: window.id
        });

        dispatch(tr);

        e.preventDefault();
        e.stopPropagation();
      };
      this.tableVerticalWrapper.prepend(
        this.filterStatusIndicatorScrollContainer
      );
    }
    // TODO: Find a way not to update it on every update
    this.activeFiltersBtn.lastChild.innerText =
      node.attrs.filters && node.attrs.filters.length
        ? `${node.attrs.filters.length} filter${
            node.attrs.filters.length > 1 ? 's' : ''
          }`
        : 'Add filter';
  }

  update(node, markers) {
    this.updateMarkers();

    if (node.type != this.node.type) {
      return false;
    }
    this.buildActiveFiltersButton(node);

    if (!this.node.sameMarkup(node)) {
      return false;
    }

    // to handle first row/col insert
    if (!node.firstChild.firstChild.eq(this.node.firstChild.firstChild)) {
      return false;
    }

    updateColumns(node, this.colgroup, this.table, this.cellMinWidth);

    if (firstRowOrderChanged(node.nodeAt(0), this.node.nodeAt(0))) {
      node.attrs.sort = {
        col: null,
        dir: null
      };
      this.node = node;
      return false;
    }

    this.node = node;

    return true;
  }

  ignoreMutation(record) {
    const isCellsArrangement =
      record.target.className === 'tableRowGhost' ||
      record.target.className === 'tableColGhost' ||
      record.type === 'childList';

    return (
      (record.type == 'attributes' &&
        (record.target == this.table ||
          this.colgroup.contains(record.target) ||
          record.target == this.dom)) ||
      isCellsArrangement
    );
  }
}

export function updateColumns(
  node,
  colgroup,
  table,
  cellMinWidth,
  overrideCol,
  overrideValue
) {
  let totalWidth = 0,
    fixedWidth = true;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;
  for (let i = 0, col = 0; i < row.childCount; i++) {
    const {colspan, colwidth} = row.child(i).attrs;
    for (let j = 0; j < colspan; j++, col++) {
      const hasWidth =
        overrideCol == col ? overrideValue : colwidth && colwidth[j];
      const cssWidth = hasWidth ? hasWidth + 'px' : '';
      totalWidth += hasWidth || cellMinWidth;
      if (!hasWidth) fixedWidth = false;
      if (!nextDOM) {
        colgroup.appendChild(document.createElement('col')).style.width =
          cssWidth;
      } else {
        if (nextDOM.style.width != cssWidth) nextDOM.style.width = cssWidth;
        nextDOM = nextDOM.nextSibling;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode.removeChild(nextDOM);
    nextDOM = after;
  }

  if (fixedWidth) {
    table.style.width = totalWidth + 'px';
    table.style.minWidth = '';
  } else {
    table.style.width = '';
    table.style.minWidth = totalWidth + 'px';
  }
}

// this function should return true when the columns order has been changed;
const firstRowOrderChanged = (newRow, oldRow) => {
  const newCells = newRow.content.content;
  const oldCells = oldRow.content.content;

  // col number changed so its not columns dragging
  if (newCells.length !== oldCells.length) return false;

  let rowChanged = false;

  newCells.forEach((cell, index) => {
    rowChanged =
      rowChanged ||
      (cell !== oldCells[index] && !cell.content.eq(oldCells[index].content));
  });

  return rowChanged;
};
