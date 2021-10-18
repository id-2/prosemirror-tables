import {MenuItem} from 'prosemirror-menu';
import {
  sortColumn,
  addColAfterButton,
  addColBeforeButton,
} from '../../commands';
import {HoverDropdown} from '../../menuDropdown/Dropdown';
import {createElementWithClass, getColIndex} from '../../util';
import {getTypesItems} from '../../columnsTypes/typesMenuItems';
import {tableHeadersMenuKey} from '../../columnsTypes/types.config';
import {deleteColAtPos} from '../../commands';
import { tableFiltersMenuKey } from '../../filters/utils';

const createMenuItemWithIcon = (className, label, iconClassName) => {
  const item = createElementWithClass('div', className);
  item.innerText = label;
  const icon = createElementWithClass('div', iconClassName);

  item.prepend(icon);

  return item;
};

export const dropdownClassName = 'columnTypeDropdown';

const columnTypesItems = getTypesItems();

const columnTypeDropdown = () => {
  return new HoverDropdown(columnTypesItems, {
    class: dropdownClassName,
  });
};

const sortItem = (direction) => {
  return new MenuItem({
    render() {
      const className = `sort-${direction === 1 ? 'down' : 'up'}`;
      return createMenuItemWithIcon(
        className + ' menuItem',
        `Sort ${direction === 1 ? 'A > Z' : 'Z > A'}`,
        className + '-icon  menuIcon'
      );
    },
    run(state, dispatch, view) {
      const {pos} = tableHeadersMenuKey.getState(state);
      const colIndex = getColIndex(state, pos);
      sortColumn(view, colIndex, pos, direction);
    },
  });
};

const insertColumnItem = (direction) => {
  return new MenuItem({
    render() {
      const className = `insert-${direction === 1 ? 'right' : 'left'}`;
      return createMenuItemWithIcon(
        className + ' menuItem',
        `Insert ${direction === 1 ? 'right' : 'left'}`,
        className + '-icon  menuIcon'
      );
    },
    run(state, dispatch, view) {
      const command = direction === 1 ? addColAfterButton : addColBeforeButton;
      const {pos} = tableHeadersMenuKey.getState(state);
      command(view, pos);
    },
  });
};

const filterItem = () => {
  return new MenuItem({
    render() {
      return createMenuItemWithIcon(
        'filters-colum menuItem',
        `Add filter`,
        'filters-colum-icon  menuIcon'
      );
    },
    run(state, dispatch) {
      const {pos, dom: tableDom, node: table} = tableHeadersMenuKey.getState(state);
      const {tr} = state;
      tr.setMeta(tableFiltersMenuKey, {
        action: 'open',
        dom: tableDom,
        node: table,
        pos,
        id: window.id
      })
      tr.setMeta(tableHeadersMenuKey, {
        action: 'close',
        id: window.id
      })

      dispatch(tr)
    }
  });
};

const deleteItem = () => {
  return new MenuItem({
    render() {
      return createMenuItemWithIcon(
        'delete-colum menuItem',
        `Delete column`,
        'delete-colum-icon  menuIcon'
      );
    },
    run(state, dispatch, view) {
      const {pos} = tableHeadersMenuKey.getState(state);
      deleteColAtPos(pos, view);
    },
  });
};

export const menuItems = [
  [columnTypeDropdown()],
  [
    filterItem(),
    sortItem(1),
    sortItem(-1),
    insertColumnItem(1),
    insertColumnItem(-1),
    deleteItem(),
  ],
];
