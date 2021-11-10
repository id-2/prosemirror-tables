import {
  textEquality,
  textInequality,
  textContains,
  textNotContains,
  isTextEmpty,
  isTextNotEmpty,
  smallerOrEquals,
  smaller,
  greater,
  greaterOrEquals,
  isNumberEmpty,
  isNumberNotEmpty,
  numberEquality,
  numberInequality,
  isBefore,
  isAfter,
  isOn,
  isDateEmpty,
  isDateNotEmpty,
  checkboxEquality,
  checkboxInequality,
  currencyEquality,
  currencyInequality,
  currencySmallerOrEquals,
  currencySmaller,
  currencyGreater,
  currencyGreaterOrEquals,
  CHECKBOX_DROPDOWN_ITEMS,
  CHECKED_ITEM_VALUE,
  labelsEquality,
  labelsInEquality,
  labelsIsAny,
  labelsIsNone,
  labelsIsEmpty,
  labelsIsNotEmpty,
} from './filtersLogic';

export const filterConfigByType = {
  text: [
    {
      id: 'text-equality',
      label: 'Is',
      logic: textEquality,
      defaultValue: '',
      default: true,
      inputType: 'input',
    },
    {
      id: 'text-in-equality',
      label: 'Is Not',
      logic: textInequality,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'text-contains',
      label: 'Contains',
      logic: textContains,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'text-not-contains',
      label: 'Does Not Contain',
      logic: textNotContains,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'text-empty',
      label: 'Is Empty',
      logic: isTextEmpty,
      defaultValue: null,
    },
    {
      id: 'text-not-empty',
      label: 'Is Not Empty',
      logic: isTextNotEmpty,
      defaultValue: null,
    },
  ],
  number: [
    {
      id: 'number-equality',
      label: '=',
      logic: numberEquality,
      defaultValue: '',
      default: true,
      inputType: 'input',
    },
    {
      id: 'number-in-equality',
      label: '≠',
      logic: numberInequality,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'number-smaller-or-equal',
      label: '≤',
      logic: smallerOrEquals,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'number-smaller',
      label: '<',
      logic: smaller,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'number-greater',
      label: '>',
      logic: greater,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'number-greater-or-equal',
      label: '≥',
      logic: greaterOrEquals,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'number-is-empty',
      label: 'Is Empty',
      logic: isNumberEmpty,
      defaultValue: null,
    },
    {
      id: 'number-not-empty',
      label: 'Is Not Empty',
      logic: isNumberNotEmpty,
      defaultValue: null,
    },
  ],
  date: [
    {
      id: 'is-on',
      label: 'Is On',
      logic: isOn,
      defaultValue: new Date().getTime(),
      default: true,
      inputType: 'date-picker',
    },
    {
      id: 'is-before',
      label: 'Is Before',
      logic: isBefore,
      defaultValue: new Date().getTime(),
      inputType: 'date-picker',
    },
    {
      id: 'is-after',
      label: 'Is After',
      logic: isAfter,
      defaultValue: new Date().getTime(),
      inputType: 'date-picker',
    },
    {
      id: 'date-is-empty',
      label: 'Is Empty',
      logic: isDateEmpty,
      defaultValue: null,
    },
    {
      id: 'date-not-empty',
      label: 'Is Not Empty',
      logic: isDateNotEmpty,
      defaultValue: null,
    },
  ],
  labels: [
    {
      id: 'labels-equals',
      label: 'Is',
      logic: labelsEquality,
      defaultValue: [],
      default: true,
      inputType: 'labels-dropdown',
    },
    {
      id: 'labels-not-equal',
      label: 'Is Not',
      logic: labelsInEquality,
      defaultValue: [],
      inputType: 'labels-dropdown',
    },
    {
      id: 'label-is-any',
      label: 'Is Any Of',
      logic: labelsIsAny,
      defaultValue: [],
      inputType: 'labels-dropdown',
    },
    {
      id: 'label-is-none',
      label: 'Is None Of',
      logic: labelsIsNone,
      defaultValue: [],
      inputType: 'labels-dropdown',
    },
    {
      id: 'label-is-empty',
      label: 'Is Empty',
      logic: labelsIsEmpty,
      defaultValue: 'checked',
      inputType: null,
    },
    {
      id: 'label-is-not-empty',
      label: 'Is Not Empty',
      logic: labelsIsNotEmpty,
      defaultValue: null,
      inputType: null,
    },
  ],
  currency: [
    {
      id: 'currency-equality',
      label: '=',
      logic: currencyEquality,
      defaultValue: '',
      default: true,
      inputType: 'input',
    },
    {
      id: 'currency-in-equality',
      label: '≠',
      logic: currencyInequality,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'currency-smaller-or-equal',
      label: '≤',
      logic: currencySmallerOrEquals,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'currency-smaller',
      label: '<',
      logic: currencySmaller,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'currency-greater',
      label: '>',
      logic: currencyGreater,
      defaultValue: '',
      inputType: 'input',
    },
    {
      id: 'currency-greater-or-equal',
      label: '≥',
      logic: currencyGreaterOrEquals,
      defaultValue: '',
      inputType: 'input',
    },
  ],
  checkbox: [
    {
      id: 'checkbox-equals',
      label: 'Is',
      logic: checkboxEquality,
      defaultValue: CHECKED_ITEM_VALUE,
      default: true,
      inputType: 'dropdown',
      inputDropdownItems: () => CHECKBOX_DROPDOWN_ITEMS,
    },
    {
      id: 'checkbox-not-equal',
      label: 'Is Not',
      logic: checkboxInequality,
      defaultValue: CHECKED_ITEM_VALUE,
      inputType: 'dropdown',
      inputDropdownItems: () => CHECKBOX_DROPDOWN_ITEMS,
    },
  ],
};