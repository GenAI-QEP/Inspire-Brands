import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { cloneDeep, filter, find, get, includes, isEmpty, isEqual, nth } from 'lodash';
import config from 'react-native-ultimate-config';
import { getAccessibilityLabel, OverridableButton } from '@inspire-app/ui-components';
import { useSelector } from 'react-redux';
import { EModifierGroupType, roundPriceToString, TBagModifierGroup } from '@inspire-app/core';

import { colors, GroupSelectorList, MEDIUM_BUTTON_HEIGHT, SectionHeaderExtended } from 'ui';
import { EModalScreens } from 'navigation/constants';
import { TModalsParamList } from 'navigation/types';
import { useModifiersHandler, useRelatedProducts } from 'core/hooks';
import { select } from 'core/selectors';
import { TSaucesSectionItem, useMultipleModifiersSections } from 'core/hooks/product/useModifiersSections';
import { handleModifyExtraAnalytics } from 'containers/ProductDetails/BWW/helpers';
import { ANALYTICS_PARAM_LENGTH } from 'core/analytics';

import ModifyModifierListItem from './ModifyModiferListItem';
import { FLOATING_BUTTON_PADDING, LIST_PADDING, styles } from './styles';

export type TGroupModifierItemListProps = RouteProp<TModalsParamList, EModalScreens.MODIFY_MODIFIER_MODAL>;

const ALLOWED_GROUPS = [
  EModifierGroupType.SAUCES,
  EModifierGroupType.MODIFICATIONS,
  EModifierGroupType.SELECTIONS,
  EModifierGroupType.WINGTYPE,
];
const ModifyModifierList: React.FC = () => {
  const { t } = useTranslation(config.BRAND);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const navigation = useNavigation();

  const {
    params: {
      productId,
      displayName,
      preSelectedModifiers,
      modifySections,
      onModifiersChange,
      isRelatedModifierAvailable,
      isOptionModifierAvailable,
    },
  } = useRoute<TGroupModifierItemListProps>();

  const product = useSelector(select.product.byId(productId));
  const productModifiers = useSelector(select.product.filledModifiers(productId));

  const { size, id } = product;

  const {
    getItemSelectionStatus,
    increment,
    decrement,
    remove,
    singleSelect,
    modifiers,
    getGroupMaxStatus,
    getWithoutAnythingModifier,
    initialSelectedModifiers,
  } = useModifiersHandler(preSelectedModifiers);

  const [savedMods] = useState(cloneDeep(modifiers));

  const relatedProducts = useRelatedProducts(productId);
  const productSizes = useSelector(select.menu.sizeGroupNames(relatedProducts));

  const optionProducts = useSelector(select.product.optionProductsById(productId));

  const selectableItemCounter = useMemo(() => get(nth(modifySections, 0), 'title.maxQuantity'), [modifySections]);

  const composedSelectedButtonStyle = StyleSheet.compose(styles.selectedButtonStyle, {
    backgroundColor: colors.black,
  });

  const composedSelectedTextStyle = StyleSheet.compose(styles.selectedTextStyle, {
    color: colors.white,
  });
  const [selectedGroup, setSelectedGroup] = useState(!isEmpty(productSizes) ? size : productId);
  const [modifySectionState, setModifySectionState] = useState(cloneDeep(modifySections));
  const [selectedSizeId, setSelectedSizeId] = useState(id);

  const modifyModifiers = useSelector(select.product.filledModifiers(selectedSizeId));
  const allowedModifiersGroup = useMemo(() => {
    const groups = filter(modifyModifiers, ({ modifierGroupType }) => includes(ALLOWED_GROUPS, modifierGroupType));

    return groups;
  }, [modifyModifiers]);

  const sections = useMultipleModifiersSections(allowedModifiersGroup);

  useEffect(() => {
    if (!isEmpty(productSizes) && !isEqual(sections, modifySectionState)) {
      setModifySectionState(sections);
    }
  }, [modifySectionState, productSizes, sections]);

  const handleSizeSelected = useCallback(
    (groupSelectorId: string) => {
      if (!isEmpty(productSizes)) {
        const sizeSelected = find(productSizes, ({ id }) => id === groupSelectorId);
        setSelectedSizeId(sizeSelected?.id ?? '');

        setSelectedGroup(get(sizeSelected, 'size', ''));
      } else {
        setSelectedGroup(groupSelectorId);
      }
    },
    [setSelectedGroup, productSizes],
  );

  const onModifiersSave = useCallback(() => {
    let newProduct;
    if (isEmpty(productSizes)) {
      newProduct = find(optionProducts, ['id', selectedGroup]);
    } else {
      const sizeSelected = find(productSizes, ['size', selectedGroup]);
      newProduct = find(relatedProducts, ['id', sizeSelected?.id]);
    }

    onModifiersChange(modifiers, newProduct);

    const getDisplayNamesForModifiers = (modifierItems: TBagModifierGroup[]) => {
      let displayItemsLength = 0;
      const dispalyItems = sections?.flatMap((section) => {
        const modifierItem = modifierItems?.find((modifier) => modifier.productId === section.title.productGroupId);
        if (modifierItem) {
          const selectedItems = modifierItem?.modifiers?.map((item) => {
            const sectionItem = section?.data?.find((sectionItem) => item.productId === sectionItem.modifierProductId);
            displayItemsLength += (sectionItem?.displayName?.length ?? 0) + 2;
            if (displayItemsLength < ANALYTICS_PARAM_LENGTH) {
              return sectionItem?.displayName;
            }
          });
          return selectedItems;
        } else {
          return [];
        }
      });
      return dispalyItems?.filter((item) => item?.length);
    };

    const getModifiersForAnalytics = () => {
      const newModifierItems = modifiers?.flatMap((item) => {
        const modifiers = item?.modifiers?.filter(({ quantity }) => quantity > 0);
        if (modifiers?.length !== 0) {
          return { ...item, modifiers };
        }
        return [];
      });

      const removedItems = savedMods?.flatMap((savedItem) => {
        const newItems = newModifierItems?.find(({ productId }) => productId === savedItem.productId);
        const removedModifiers = savedItem?.modifiers?.filter(
          (mod) => !newItems?.modifiers?.some((newMod) => newMod.productId === mod.productId) && mod.quantity > 0,
        );
        if (removedModifiers.length !== 0) {
          return {
            ...savedItem,
            modifiers: removedModifiers,
          };
        } else {
          return [];
        }
      });

      return {
        addOptions: getDisplayNamesForModifiers(newModifierItems),
        removeOptions: getDisplayNamesForModifiers(removedItems),
      };
    };
    const { addOptions, removeOptions } = getModifiersForAnalytics();

    if (removeOptions?.length > 0) {
      handleModifyExtraAnalytics(displayName, removeOptions.join(', '), false);
    }
    if (addOptions?.length > 0) {
      handleModifyExtraAnalytics(displayName, addOptions.join(', '), true);
    }
    navigation.goBack();
  }, [
    productSizes,
    onModifiersChange,
    modifiers,
    navigation,
    optionProducts,
    selectedGroup,
    relatedProducts,
    displayName,
    sections,
    savedMods,
  ]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const keyExtractor = useCallback(({ modifierProductId }) => modifierProductId, []);
  const renderHeader = useCallback(({ section }: { section: TSaucesSectionItem }) => {
    if (isEmpty(section.title.displayName)) return null;
    return <SectionHeaderExtended headerText={section.title.displayName} subheaderText="" />;
  }, []);

  const renderItem = useCallback(
    ({ item, section }) => {
      const {
        title: { productGroupId, maxQuantity },
      } = section;

      const isMultipleItemSelectable = maxQuantity > 1;
      const isGroupMaxReached = getGroupMaxStatus(productGroupId, maxQuantity);
      const group = find(productModifiers, (modifier) => modifier.productGroupId === productGroupId);
      const withoutAnythingModifier = group ? getWithoutAnythingModifier(group) : undefined;

      return (
        <ModifyModifierListItem
          productGroupId={productGroupId}
          displayName={displayName}
          key={item.modifierProductId}
          isMultipleModifiersSelectable={isMultipleItemSelectable}
          item={item}
          getItemSelectionStatus={getItemSelectionStatus}
          increment={increment}
          decrement={decrement}
          remove={remove}
          selectSingleItem={singleSelect}
          isGroupMaxReached={isGroupMaxReached}
          withoutAnythingModifier={!!withoutAnythingModifier}
          groupMaxQuantity={maxQuantity}
        />
      );
    },
    [
      getGroupMaxStatus,
      productModifiers,
      getWithoutAnythingModifier,
      displayName,
      getItemSelectionStatus,
      increment,
      decrement,
      remove,
      singleSelect,
    ],
  );

  const bottom = bottomInset + FLOATING_BUTTON_PADDING;
  const buttonContainerStyles = StyleSheet.compose(styles.buttonContainer, {
    bottom,
  });
  const contentContainerStyle = StyleSheet.compose(styles.sectionList, {
    paddingBottom: bottom + MEDIUM_BUTTON_HEIGHT + LIST_PADDING,
  });

  const getSubText = useCallback(
    (item) =>
      !isEmpty(optionProducts)
        ? `$${roundPriceToString(item.defaultPrice)}`
        : !isEmpty(productSizes)
          ? `$${roundPriceToString(item.price)}`
          : '',
    [optionProducts, productSizes],
  );

  useEffect(() => {
    const count = selectableItemCounter ?? 1;

    navigation.setOptions({
      title: t('menu.productDetails.modifierSelection.modifyModifier', {
        count,
        displayName,
      }),
    });
  }, [displayName, navigation, selectableItemCounter, t]);

  const isGroupSelectorEnabled = isRelatedModifierAvailable || isOptionModifierAvailable;
  const groupSelectorTitle =
    isGroupSelectorEnabled && !isEmpty(productSizes)
      ? t('menu.productDetails.groupSelectors.size')
      : t('menu.productDetails.groupSelectors.options');
  const groupSelectorSubtitle = !isEmpty(productSizes) ? t('menu.productDetails.groupSelectors.sizeSubtitle') : '';

  const [hasChangeInModifiers, setHasChangeInModifiers] = useState(false);

  useEffect(() => {
    const isGroupSelectionChanged = isGroupSelectorEnabled && !isEqual(id, selectedGroup);
    setHasChangeInModifiers(!isEqual(initialSelectedModifiers, modifiers) || isGroupSelectionChanged);
  }, [id, initialSelectedModifiers, isGroupSelectorEnabled, modifiers, selectedGroup, selectedSizeId]);

  return (
    <View style={styles.container} {...getAccessibilityLabel('', 'extrasProductModifyModifierScreenContainer')}>
      {isGroupSelectorEnabled && (
        <View style={styles.sizeOptionStyle}>
          <View style={styles.sizeOptionlabelStyle}>
            <SectionHeaderExtended headerText={groupSelectorTitle} subheaderText={groupSelectorSubtitle} />
          </View>
          <GroupSelectorList
            selectedGroup={selectedGroup}
            productGroup={productSizes}
            optionProducts={optionProducts}
            style={styles.sizeContainer}
            selectedButtonStyle={composedSelectedButtonStyle}
            selectedTextStyle={composedSelectedTextStyle}
            onPress={handleSizeSelected}
            labelBackgroundColor={colors.primary}
            labelTextColor={colors.black}
            subTextStyle={styles.subTextStyle}
            getSubText={getSubText}
            {...getAccessibilityLabel('', 'modifyModifierProductSizeContainer')}
          />
        </View>
      )}

      <SectionList
        contentContainerStyle={contentContainerStyle}
        initialNumToRender={20}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        sections={modifySectionState}
        renderSectionHeader={renderHeader}
        renderItem={renderItem}
      />

      <View style={buttonContainerStyles}>
        <OverridableButton
          variant="OutlinedButton"
          style={styles.outlinedButton}
          text={t('menu.productDetails.cancelButton')}
          onPress={onCancel}
        />
        <OverridableButton
          variant="FilledButton"
          style={styles.filledButton}
          text={t('menu.productDetails.saveButton')}
          isDisabled={!hasChangeInModifiers}
          onPress={onModifiersSave}
        />
      </View>
    </View>
  );
};

export default React.memo(ModifyModifierList);
