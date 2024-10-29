import { IBagItem, IOrderItem } from '../../types';

export const orderItemsMock = [
  { lineItemId: 1, offers: true, discountableQuantity: 2, childItems: [] },
  { lineItemId: 2, offers: true, discountableQuantity: 0, childItems: [{ offers: true, discountableQuantity: 1 }] },
  { lineItemId: 3, offers: false, discountableQuantity: 2, childItems: [] },
] as unknown as IOrderItem[];

export const allBagItemsMock = [
  { lineItemId: 1, quantity: 5 },
  { lineItemId: 2, quantity: 3 },
] as unknown as IBagItem[];

export const bagItemsMock = [
  { lineItemId: 1, quantity: 5 },
  { lineItemId: 3, quantity: 1 },
] as IBagItem[];

export const promoBagItemMock = { lineItemId: 1, quantity: 3 } as IBagItem;

export const responseSplitBagItemsMock = [
  { lineItemId: 1, quantity: 1 },
  {
    productId: undefined,
    price: undefined,
    priceType: undefined,
    quantity: 2,
    modifierGroups: undefined,
    categoryValidity: undefined,
    lineItemId: 101,
    listName: undefined,
    displayName: undefined,
    childItems: undefined,
  },
  { lineItemId: 3, quantity: 1 },
];

export const noDiscountableItemsMock = [
  { lineItemId: 4, offers: false, discountableQuantity: 0, childItems: [] },
] as unknown as IOrderItem[];
