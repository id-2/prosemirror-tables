import React from 'react';
import ReactDOM from 'react-dom';
import {Plugin} from 'prosemirror-state';
import {
  generateMenuPopup,
  displayPopup,
  tableFiltersMenuKey,
  calculateMenuPosition,
} from './utils';
import {TableFiltersComponent} from './Component.jsx';

class TableFiltersMenuView {
  constructor(view) {
    this.view = view;

    this.buildMenuDOM();

    // append popup to dom
    this.popUpRelativeContainer.appendChild(this.popUpDOM);
  }

  buildMenuDOM() {
    this.popUpDOM = generateMenuPopup();

    // the dom element that contains the popup - should be css relative
    this.popUpRelativeContainer = document.getElementsByClassName(
      'czi-editor-frame-body'
    )[0];

    const existingPopUps = Array.from(
      document.getElementsByClassName('tableFiltersMenu')
    );

    if (existingPopUps.length > 0) {
      existingPopUps.forEach((popup) => {
        popup.remove();
      });
    }
  }

  updateMenu(view) {
    // determine whether to display or hide popup - and change style accordingly
    const tablesData = displayPopup(view, this.popUpDOM);

    if (tablesData && this.tablesData && tablesData.pos !== this.tablesData.pos) {
      this.onClose();
    }

    if (!tablesData) {
      // handle close
      if (this.tablesData) this.onClose();
      // hide menu
      if (this.popUpDOM.style.display !== 'none')
        this.popUpDOM.style.display = 'none';

      return;
    }

    if (!this.tablesData && tablesData) {
      this.tablesData = tablesData;
      this.onOpen();
    }

    // calculate popup position
    calculateMenuPosition(this.popUpDOM, tablesData);

    return;
  }

  update(view) {
    const {state, readOnly} = view;
    if (!state || readOnly) {
      if (this.popUpDOM.style.display !== 'none') {
        this.popUpDOM.style.display = 'none';
      }
    }

    this.updateMenu(view);
  }

  onOpen() {
    ReactDOM.render(
      <TableFiltersComponent
        dom={this.tablesData.dom}
        table={this.tablesData.node}
        pos={this.tablesData.pos}
        view={this.view}
      />,
      this.popUpDOM
    );
  }

  onClose() {
    this.tablesData = null;

    ReactDOM.unmountComponentAtNode(this.popUpDOM);

    return;
  }

  destroy() {}
}

export const TableFiltersMenu = () => {
  return new Plugin({
    key: tableFiltersMenuKey,
    view(view) {
      const menuView = new TableFiltersMenuView(view);

      return menuView;
    },
    state: {
      init() {
        return null;
      },
      apply(tr, value, oldState, newState) {
        const action = tr.getMeta(tableFiltersMenuKey);
        if (action && action.id === window.id && action.action === 'open') {
          return action;
        }

        if (action && action.id === window.id && action.action === 'close') {
          return null;
        }

        return value;
      },
    }
  })
}
