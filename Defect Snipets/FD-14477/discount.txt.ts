import { getPromoBagItemHelper, getSplitBagItemsHelper } from '../discount';
import {
  orderItemsMock,
  allBagItemsMock,
  bagItemsMock,
  promoBagItemMock,
  responseSplitBagItemsMock,
  noDiscountableItemsMock,
} from '../__mocks__/discount';
describe('discount', () => {
  describe('getPromoBagItemHelper', () => {
    test('should return undefined if location is not applicable', () => {
      expect(getPromoBagItemHelper(orderItemsMock, false, true)).toBeUndefined();
    });

    test('should return an array of lineItemIds if promo recurrence is available', () => {
      expect(getPromoBagItemHelper(orderItemsMock, true, true)).toEqual([1, 2]);
    });

    test('should return undefined if no discountable items are present and promo recurrence is not available', () => {
      expect(getPromoBagItemHelper(noDiscountableItemsMock, true, false)).toBeUndefined();
    });
  });

  describe('getSplitBagItemsHelper', () => {
    test('should correctly split the promo bag item and update bag items list', () => {
      const result = getSplitBagItemsHelper(allBagItemsMock, bagItemsMock, promoBagItemMock);
      expect(result).toEqual(responseSplitBagItemsMock);
    });
  });
});
