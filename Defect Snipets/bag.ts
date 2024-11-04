import { get, omit, toUpper } from 'lodash';

import {
  IBagItem,
  IConfig,
  IRewardsApplyPayload,
  IRewardsApplyResponse,
  IRewardsDiscountRequestBody,
  IRewardsRemovePayload,
  IRewardsRemoveResponse,
  TDiscountedOrder,
} from '../../types';
import { addOfferToBagAction, clearOffersFromBagAction, removeAppliedPromoCode, setBagItems } from '../actions';
import { ResponseError } from '../../types/responseError';
import { TRootState } from '../../store/types';
import { getPromoBagItemHelper, getSplitBagItemsHelper } from '../../helpers';
import { select } from '../../selectors';

import { TApiSlice } from './api';

export const createBagApi = (apiSlice: TApiSlice, config: IConfig) => {
  const service = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      applyPromoCode: builder.mutation<IRewardsApplyResponse, IRewardsApplyPayload>({
        query: (body) => {
          let url = `/customer/rewards/apply?brandId=${config.brandId}`;
          if (config.appendLocationToReward && body.location.id) {
            url += `&location=${body.location.id}`;
          }
          return {
            url,
            method: 'POST',
            body: { ...omit(body, 'disablePromoUiBrands'), promocode: toUpper(body.promocode) },
          };
        },
        /**
         * @see https://redux-toolkit.js.org/rtk-query/api/createApi#onquerystarted
         */
        async onQueryStarted(body, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            const offer = data.offers[0];
            if (!body.disablePromoUiBrands) {
              dispatch(
                addOfferToBagAction({
                  id: offer.id,
                  userOfferId: offer.userOfferId,
                  name: offer.name,
                  endDate: offer.endDateTime,
                  type: offer.type,
                  image: offer.imageUrl,
                  applicability: offer.applicability,
                  locationRestrictions: offer.locationRestrictions,
                  posDiscountId: offer.posDiscountId,
                }),
              );
            }
          } catch (err) {}
        },
        transformErrorResponse(response, _, arg) {
          return {
            defaultPromocode: arg.promocode,
            errorCode: get(response, ['data', 'data', 0, 'code'], 'GENERIC'),
            errorReasonCode: get(response, ['data', 'data', 0, 'reasonCode'], ''),
            defaultErrorMessage: get(response, ['data', 'message'], ''),
            status: response.status,
          };
        },
        extraOptions: { maxRetries: 0, use_V3: config.use_V3 },
      }),
      removePromoCode: builder.mutation<IRewardsRemoveResponse, IRewardsRemovePayload>({
        query: (body) => ({
          url: `/customer/rewards/remove?brandId=${config.brandId}`,
          method: 'POST',
          body: { ...body, promocode: toUpper(body.promocode) },
        }),
        /**
         * @see https://redux-toolkit.js.org/rtk-query/api/createApi#onquerystarted
         */
        async onQueryStarted(_body, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(clearOffersFromBagAction());
            dispatch(removeAppliedPromoCode());
          } catch (err) {
            if ((err as ResponseError).status === 400) {
              dispatch(clearOffersFromBagAction());
              dispatch(removeAppliedPromoCode());
            }
          }
        },
        transformErrorResponse(response, _, arg) {
          return {
            defaultPromocode: arg.promocode,
            errorCode: get(response, ['data', 'data', 0, 'code'], 'GENERIC'),
            errorReasonCode: get(response, ['data', 'data', 0, 'reasonCode'], ''),
            defaultErrorMessage: get(response, ['data', 'message'], ''),
            status: response.status,
          };
        },
        extraOptions: { maxRetries: 0, use_V3: config.use_V3 },
      }),
      getRewardsDiscount: builder.mutation<
        TDiscountedOrder,
        {
          body: IRewardsDiscountRequestBody;
          mergedEqualBagItems: IBagItem[];
          allBagItems: IBagItem[];
          onError: () => void;
        }
      >({
        async queryFn(
          { body, mergedEqualBagItems, allBagItems, onError },
          { getState, dispatch },
          _extraOptions,
          baseQuery,
        ) {
          try {
            const state = getState() as TRootState;

            const { error, data } = await baseQuery({
              url: '/customer/account/discount',
              params: {
                brandId: config.brandId,
              },
              body,
              method: 'POST',
            });

            if (error) {
              onError();
              return { error };
            }

            const allUnavailableItems: IBagItem[] = select.bag.unavailableItems(state);
            const itemsIdsToRemove = select.bag.itemIdsToRemove(state);
            const isLocationApplicable = select.bag.isDealLocationApplicable(state);

            const response = data as TDiscountedOrder;
            const itemsToRemove = allBagItems.filter((item) => itemsIdsToRemove.includes(item.lineItemId));
            const promoLineItemId = getPromoBagItemHelper(response.items, isLocationApplicable, false);

            const appliedDeals = select.bag.appliedDiscounts(state);
            const isCheckLevel = !!appliedDeals[0]?.isCheckLevel;

            if (!promoLineItemId && !isCheckLevel) {
              return {
                data: response,
              };
            }

            const bagItem = mergedEqualBagItems.find((item) => item.lineItemId === promoLineItemId);

            if (isCheckLevel && !!response?.items) {
              dispatch(
                setBagItems([...mergedEqualBagItems, ...itemsToRemove], {
                  forceSet: true,
                }),
              );
            } else if (bagItem && bagItem?.quantity > 1) {
              const splitItems = getSplitBagItemsHelper(
                [...allBagItems, ...allUnavailableItems],
                mergedEqualBagItems,
                bagItem,
              );

              dispatch(
                setBagItems([...splitItems, ...itemsToRemove], {
                  forceSet: true,
                }),
              );
            }

            return {
              data: response,
            };
          } catch (e) {
            onError();
            return {
              error: {
                status: 'CUSTOM_ERROR',
                data: e,
                error: '',
              },
            };
          }
        },
      }),
    }),
  });

  const { useApplyPromoCodeMutation, useRemovePromoCodeMutation, useGetRewardsDiscountMutation } = service;

  return {
    endpoints: service.endpoints,
    hooks: {
      useApplyPromoCodeMutation,
      useRemovePromoCodeMutation,
      useGetRewardsDiscountMutation,
    },
  };
};
