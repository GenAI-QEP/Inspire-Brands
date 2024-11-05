import { omit, reduce } from 'lodash';

import { IBagItem, IChildItem, IOrderItem, TUpdateItems } from '../types';

import { getItemWithNextLineIds } from './bag';

export const getPromoBagItemHelper = (
  bagItems: IOrderItem[],
  isLocationApplicable: boolean,
  isPromoRecurrenceAvailable: boolean,
): number | number[] | undefined => {
  if (!isLocationApplicable) {
    return undefined;
  }

  const discountable = reduce(
    bagItems,
    (
      acc: {
        fullDiscountableQuantity: number;
        discountableItems: IOrderItem[];
      },
      item: IOrderItem,
    ) => {
      if (item.offers && item.discountableQuantity && item.discountableQuantity >= 1) {
        return {
          fullDiscountableQuantity: acc.fullDiscountableQuantity + item.discountableQuantity,
          discountableItems: [...acc.discountableItems, item],
        };
      }

      const discountableChild: IChildItem | undefined = item.childItems?.find(
        (childItem) => childItem.offers && childItem.discountableQuantity && childItem.discountableQuantity >= 1,
      );

      if (discountableChild) {
        return {
          fullDiscountableQuantity: discountableChild?.discountableQuantity
            ? acc.fullDiscountableQuantity + discountableChild?.discountableQuantity
            : acc.fullDiscountableQuantity,
          discountableItems: [...acc.discountableItems, item],
        };
      }
      return acc;
    },
    { fullDiscountableQuantity: 0, discountableItems: [] },
  );

  if (isPromoRecurrenceAvailable) return discountable.discountableItems.map((item) => item.lineItemId);

  if (discountable.fullDiscountableQuantity > 1) {
    return undefined;
  }

  return discountable.discountableItems[0]?.lineItemId;
};

export const getSplitBagItemsHelper = (
  allBagItems: IBagItem[],
  bagItems: IBagItem[],
  promoBagItem: IBagItem,
): TUpdateItems => {
  const { quantity, ...restProps } = omit(promoBagItem, 'lineItemId');

  const firstBagItem = {
    ...promoBagItem,
    quantity: 1,
  };

  const secondBagItemPayload = {
    ...restProps,
    quantity: quantity - 1,
  };

  const newBagItem = getItemWithNextLineIds(allBagItems, secondBagItemPayload);

  const restBagItems = bagItems.filter((item) => item.lineItemId !== promoBagItem.lineItemId);

  return [firstBagItem, newBagItem, ...restBagItems];
};
